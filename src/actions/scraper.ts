"use server";

import * as cheerio from "cheerio";
import { db } from "@/lib/db";
import { SUPPORTED_SITES, SiteConfig } from "@/lib/scraper-config";
import { revalidatePath } from "next/cache";
import { Gender, ActivityLevel, Goal } from "@prisma/client";

const DEMO_USER_ID = "demo-user-id"; // Fallback for automated scraping

async function ensureDemoUser() {
    await db.user.upsert({
        where: { id: DEMO_USER_ID },
        update: {}, // No updates needed if exists
        create: {
            id: DEMO_USER_ID,
            email: "scraper@madplan.nu",
            height: 180,
            weight: 75,
            age: 30,
            gender: Gender.MALE,
            activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            goal: Goal.MAINTAIN,
            bmr: 1800,
            dailyCalorieGoal: 2000
        }
    });
}

interface ScrapeResult {
    success: boolean;
    message: string;
    recipeId?: string;
    url?: string;
}

export async function scrapeRecipe(url: string, siteKey: string): Promise<ScrapeResult> {
    try {
        const config = SUPPORTED_SITES[siteKey];
        if (!config) return { success: false, message: "Invalid site configuration" };

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Madplan.nu Scraper/1.0 (bot)"
            }
        });

        if (!response.ok) {
            return { success: false, message: `Failed to fetch URL: ${response.status}` };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let recipeData: any = null;

        // 1. Try JSON-LD
        if (config.jsonLd) {
            const jsonLdScripts = $('script[type="application/ld+json"]');
            jsonLdScripts.each((_, element) => {
                try {
                    const content = $(element).html();
                    if (!content) return;
                    const json = JSON.parse(content);

                    const findRecipe = (obj: any): any => {
                        if (!obj) return null;
                        if (obj["@type"] === "Recipe") return obj;
                        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
                            return obj["@graph"].find((item: any) => item["@type"] === "Recipe");
                        }
                        if (Array.isArray(obj)) {
                            return obj.find((item: any) => item["@type"] === "Recipe");
                        }
                        return null;
                    };

                    const found = findRecipe(json);
                    if (found) {
                        recipeData = found;
                        return false; // Break loop
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            });
        }

        if (!recipeData) {
            return { success: false, message: "No structured recipe data found" };
        }

        // Map extracted data to our schema
        const title = recipeData.name || $("title").text();
        const description = recipeData.description || "";
        const cleanDescription = description.replace(/<[^>]*>/g, "").slice(0, 500); // Strip HTML, limit length

        // Instructions can be string, array of strings, or ItemList
        // Instructions: ensure we store as string[]
        let instructions: string[] = [];
        if (typeof recipeData.recipeInstructions === "string") {
            // If it's a single string, wrap it or split it?
            // Often it's newline separated if it's a blob
            instructions = recipeData.recipeInstructions.split(/\n+/).filter(Boolean);
        } else if (Array.isArray(recipeData.recipeInstructions)) {
            instructions = recipeData.recipeInstructions.map((step: any) => {
                if (typeof step === "string") return step;
                if (step.text) return step.text;
                if (typeof step === "object" && step.name) return step.name;
                return "";
            }).filter((s: string) => s);
        }

        // Ingredients
        let ingredients: string[] = [];
        if (Array.isArray(recipeData.recipeIngredient)) {
            ingredients = recipeData.recipeIngredient;
        }

        // Image
        let imageUrl = "";
        if (recipeData.image) {
            if (typeof recipeData.image === "string") imageUrl = recipeData.image;
            else if (Array.isArray(recipeData.image)) {
                // Try to find a URL string in the array
                const img = recipeData.image[0];
                if (typeof img === "string") imageUrl = img;
                else if (img?.url) imageUrl = img.url;
            }
            else if (recipeData.image.url) imageUrl = recipeData.image.url;
        }

        // Time
        const parseDuration = (iso: string) => {
            if (!iso) return 0;
            // Simple regex for PT1H30M format
            const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
            if (!match) return 0;
            const hours = match[1] ? parseInt(match[1]) : 0;
            const minutes = match[2] ? parseInt(match[2]) : 0;
            return hours * 60 + minutes;
        };

        const prepTime = parseDuration(recipeData.prepTime);
        const cookTime = parseDuration(recipeData.cookTime);
        const totalTime = parseDuration(recipeData.totalTime) || (prepTime + cookTime);

        // Servings
        let servings = 4; // Default
        if (recipeData.recipeYield) {
            const match = recipeData.recipeYield.toString().match(/\d+/);
            if (match) servings = parseInt(match[0]);
        }

        // Ensure demo user exists
        await ensureDemoUser();

        // Save to DB
        const recipe = await db.recipe.upsert({
            where: {
                userId_sourceUrl: {
                    sourceUrl: url,
                    userId: DEMO_USER_ID // Use demo user for global recipes
                }
            },
            update: {
                title,
                description: cleanDescription,
                instructions,
                ingredients,
                imageUrl,
                prepTime,
                cookTime: cookTime || (totalTime - prepTime),
                servings,
                tags: ["scraped", config.name.toLowerCase()]
            },
            create: {
                userId: DEMO_USER_ID,
                title,
                description: cleanDescription,
                instructions,
                ingredients,
                imageUrl,
                sourceUrl: url,
                prepTime,
                cookTime: cookTime || (totalTime - prepTime),
                servings,
                tags: ["scraped", config.name.toLowerCase()]
            }
        });

        return {
            success: true,
            message: `Saved: ${title}`,
            recipeId: recipe.id,
            url
        };

    } catch (error: any) {
        console.error(`Error scraping ${url}:`, error);
        return { success: false, message: error.message, url };
    }
}

export async function crawlCategory(siteKey: string, page: number): Promise<string[]> {
    const config = SUPPORTED_SITES[siteKey];
    if (!config) return [];

    let url = config.baseUrl;
    // Handle pagination logic roughly
    if (page > 1) {
        if (siteKey === 'gourministeriet') {
            url = `${config.baseUrl}page/${page}/`;
        } else if (siteKey === 'mummum') {
            url = `${config.baseUrl}?page=${page}`;
        } else {
            // Iform default
            url = `${config.baseUrl}?page=${page - 1}`;
        }
    }

    try {
        const response = await fetch(url, { headers: { "User-Agent": "Madplan.nu Crawler" } });
        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);
        const links: string[] = [];

        $(config.recipeLinkSelector).each((_, el) => {
            const href = $(el).attr("href");
            if (href && config.urlPattern.test(href)) {
                // Resolve relative URLs if needed
                let cleanHref = href;
                if (!href.startsWith("http")) {
                    // Handle relative
                    if (href.startsWith("/")) {
                        const baseUrlObj = new URL(config.baseUrl);
                        cleanHref = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
                    }
                }
                if (!links.includes(cleanHref)) links.push(cleanHref);
            }
        });

        return links;
    } catch (error) {
        console.error("Crawl error:", error);
        return [];
    }
}
