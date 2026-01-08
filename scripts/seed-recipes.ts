
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as cheerio from "cheerio";

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// Configuration
const USER_ID = "demo-user-id"; // Hardcoded for this task as requested
const BASE_URL = "https://iform.dk/sunde-opskrifter";
const MAX_PAGES = 5; // Scrape first 5 pages to get a good foundation (~60-100 recipes)

// Helper to parse ISO 8601 duration
function parseDuration(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    const hours = parseInt(match[1]?.replace("H", "") || "0") || 0;
    const minutes = parseInt(match[2]?.replace("M", "") || "0") || 0;
    return hours * 60 + minutes;
}

async function crawlPage(pageNumber: number): Promise<string[]> {
    try {
        const url = `${BASE_URL}?page=${pageNumber}`;
        console.log(`Crawling listing page: ${url}`);

        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const links: string[] = [];
        $("a.teaser__link").each((_, el) => {
            const href = $(el).attr("href");
            if (href) {
                const fullUrl = href.startsWith("http") ? href : `https://iform.dk${href}`;
                links.push(fullUrl);
            }
        });

        return Array.from(new Set(links));
    } catch (error) {
        console.error(`Failed to crawl page ${pageNumber}:`, error);
        return [];
    }
}

async function scrapeRecipe(url: string) {
    try {
        console.log(`Scraping recipe: ${url}`);
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract JSON-LD
        let jsonLdData: any = null;
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const content = JSON.parse($(el).html() || "");
                const schemas = Array.isArray(content) ? content : [content];
                const recipeSchema = schemas.find((s: any) => s["@type"] === "Recipe");
                if (recipeSchema) jsonLdData = recipeSchema;
            } catch (e) { }
        });

        if (!jsonLdData) {
            console.log(`[SKIP] No JSON-LD found: ${url}`);
            return false;
        }

        // Check for duplicate
        const existing = await db.recipe.findFirst({
            where: { sourceUrl: url, userId: USER_ID }
        });
        if (existing) {
            console.log(`[SKIP] Already exists: ${existing.title}`);
            return false;
        }

        // Parse Data
        const title = jsonLdData.name || $("h1").text().trim();
        const description = jsonLdData.description || $('meta[name="description"]').attr("content") || "";

        const ingredients = Array.isArray(jsonLdData.recipeIngredient)
            ? jsonLdData.recipeIngredient.map((i: string) => i.replace(/^[\d½¼¾\.]+\s*-\s*/, "").trim())
            : [];

        let instructions: string[] = [];
        if (Array.isArray(jsonLdData.recipeInstructions)) {
            instructions = jsonLdData.recipeInstructions.map((i: any) => i.text || i.toString());
        }

        const prepTime = parseDuration(jsonLdData.prepTime);
        const cookTime = parseDuration(jsonLdData.cookTime) || parseDuration(jsonLdData.totalTime);
        const servings = parseInt(jsonLdData.recipeYield?.toString() || "4") || 4;

        let imageUrl = jsonLdData.image;
        if (typeof imageUrl === 'object' && imageUrl.url) imageUrl = imageUrl.url;
        if (Array.isArray(imageUrl)) imageUrl = imageUrl[0];

        // Save to DB
        await db.recipe.create({
            data: {
                userId: USER_ID,
                title,
                description,
                ingredients,
                instructions,
                prepTime,
                cookTime,
                servings,
                tags: ["Iform.dk", "Sundt"],
                sourceUrl: url,
                imageUrl
            }
        });

        console.log(`[CREATED] ${title}`);
        return true;

    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return false;
    }
}

async function main() {
    console.log("Starting Iform.dk Recipe Seeder...");

    let totalCreated = 0;

    for (let i = 0; i < MAX_PAGES; i++) {
        const links = await crawlPage(i);
        console.log(`Found ${links.length} links on page ${i}`);

        for (const link of links) {
            const success = await scrapeRecipe(link);
            if (success) totalCreated++;
            // Polite delay
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`Seeding complete! Added ${totalCreated} new recipes.`);
}

main()
    .catch(e => {
        console.error("Fatal error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
