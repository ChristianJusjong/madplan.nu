
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import { SUPPORTED_SITES } from "../src/lib/scraper-config";
import { findJsonLd, normalizeInstructions, extractImages, parseDuration } from "../src/lib/scraper-core";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config();

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error("No database connection string found. Check .env file.");
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_USER_ID = "demo-user-id";

// Helper to delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureDemoUser() {
    const user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
    if (!user) {
        await prisma.user.create({
            data: {
                id: DEMO_USER_ID,
                email: "scraper@madplan.nu",
                height: 180,
                weight: 75,
                age: 30,
                gender: "MALE",
                activityLevel: "MODERATELY_ACTIVE",
                goal: "MAINTAIN",
                bmr: 1800,
                dailyCalorieGoal: 2000
            }
        });
        console.log("Created demo user");
    } else {
        console.log("Demo user exists");
    }
}

async function scrapeUrl(url: string, siteConfig: any) {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.status}`);
            return false;
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        let recipeData = findJsonLd($);

        if (!recipeData) {
            console.log(`No JSON-LD for ${url}`);
            return false;
        }

        // Mapping
        const title = recipeData.name || $("title").text();
        const description = (recipeData.description || "").replace(/<[^>]*>/g, "").slice(0, 500);

        const instructions = normalizeInstructions(recipeData.recipeInstructions);

        let ingredients: string[] = [];
        if (Array.isArray(recipeData.recipeIngredient)) ingredients = recipeData.recipeIngredient;

        const imageUrl = extractImages(recipeData);

        const prepTime = parseDuration(recipeData.prepTime);
        const cookTime = parseDuration(recipeData.cookTime);
        const totalTime = parseDuration(recipeData.totalTime) || (prepTime + cookTime);

        // Servings
        let servings = 4;
        if (recipeData.recipeYield) {
            const match = recipeData.recipeYield.toString().match(/\d+/);
            if (match) servings = parseInt(match[0]);
        }

        if (!title) return false;

        await prisma.recipe.upsert({
            where: { userId_sourceUrl: { sourceUrl: url, userId: DEMO_USER_ID } },
            update: {
                title, description, instructions, ingredients, imageUrl,
                prepTime: prepTime || 0, cookTime: cookTime || (totalTime - prepTime) || 0,
                servings, tags: ["scraped", siteConfig.name.toLowerCase()]
            },
            create: {
                userId: DEMO_USER_ID, title, description, instructions, ingredients, imageUrl,
                sourceUrl: url, prepTime: prepTime || 0, cookTime: cookTime || (totalTime - prepTime) || 0,
                servings, tags: ["scraped", siteConfig.name.toLowerCase()]
            }
        });

        console.log(`Saved: ${title}`);
        return true;

    } catch (e) {
        console.error(`Error scraping ${url}:`, e);
        return false;
    }
}

async function run() {
    await ensureDemoUser();

    // Configuration for limits
    const MAX_PAGES = 20;
    const PROCESSED_LINKS = new Set<string>();

    for (const [key, config] of Object.entries(SUPPORTED_SITES)) {
        // Skip Mummum as it is already scraped
        if (key === 'mummum') continue;

        console.log(`\n=== Starting ${config.name} ===`);
        let page = 1;

        while (page <= MAX_PAGES) {
            console.log(`Processing page ${page}...`);
            let pageUrl = config.baseUrl;

            // Pagination Logic
            if (page > 1) {
                if (key === 'gourministeriet') pageUrl = `${config.baseUrl}page/${page}/`;
                else if (key === 'mummum') pageUrl = `${config.baseUrl}?page=${page}`;
                else pageUrl = `${config.baseUrl}?page=${page - 1}`;
            }

            try {
                const res = await fetch(pageUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
                if (!res.ok) {
                    console.log(`Page ${page} failed or done.`);
                    break;
                }

                const html = await res.text();
                const $ = cheerio.load(html);
                const links: string[] = [];

                // Use the updated selector
                $(config.recipeLinkSelector).each((_, el) => {
                    let href = $(el).attr("href");
                    if (href) {
                        // Resolve relative URL first
                        if (!href.startsWith("http")) {
                            if (href.startsWith("/")) {
                                const u = new URL(config.baseUrl);
                                href = `${u.protocol}//${u.host}${href}`;
                            }
                        }

                        // Now check pattern on the full, resolved URL
                        if (config.urlPattern.test(href)) {
                            links.push(href);
                        }
                    }
                });

                if (links.length === 0) {
                    console.log(`No links found on page ${page} with selector '${config.recipeLinkSelector}'. Stopping site.`);
                    // Log html snippet for debugging
                    console.log("HTML Sample:", html.slice(0, 500));
                    break;
                }

                console.log(`Found ${links.length} links.`);
                let newLinksCount = 0;

                for (const link of links) {
                    if (PROCESSED_LINKS.has(link)) continue;
                    PROCESSED_LINKS.add(link);
                    newLinksCount++;

                    await scrapeUrl(link, config);
                    await delay(1000); // Polite delay
                }

                if (newLinksCount === 0) {
                    console.log("All links on this page were already processed.");
                }

            } catch (e) {
                console.error(`Error crawling page ${page}:`, e);
            }

            page++;
            await delay(1000);
        }
    }
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
