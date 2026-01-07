"use server";

import * as cheerio from "cheerio";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { cleanJsonResponse } from "@/lib/utils";

// Helper to parse ISO 8601 duration (PT20M)
function parseDuration(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0") || 0;
    const minutes = parseInt(match[2] || "0") || 0;
    return hours * 60 + minutes;
}

export async function crawlIformForLinks(page: number): Promise<string[]> {
    try {
        const url = `https://iform.dk/sunde-opskrifter?page=${page}`;
        console.log(`Crawling: ${url}`);

        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const links: string[] = [];

        $("a.teaser__link").each((_, el) => {
            const href = $(el).attr("href");
            if (href) {
                // Handle relative links
                const fullUrl = href.startsWith("http") ? href : `https://iform.dk${href}`;
                links.push(fullUrl);
            }
        });

        // Filter unique
        return Array.from(new Set(links));
    } catch (error) {
        console.error(`Failed to crawl page ${page}:`, error);
        return [];
    }
}

export async function scrapeRecipeFromUrl(url: string) {
    let { userId } = await auth();
    if (!userId) {
        console.warn("No auth, using fallback ID");
        userId = "demo-user-id";
    }
    if (!userId) throw new Error("Unauthorized");


    try {
        console.log(`Scraping: ${url}`);
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Find JSON-LD
        let jsonLdData: any = null;
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const content = JSON.parse($(el).html() || "");
                // Handle if it's an array of schemas
                const schemas = Array.isArray(content) ? content : [content];
                const recipeSchema = schemas.find((s: any) => s["@type"] === "Recipe");
                if (recipeSchema) {
                    jsonLdData = recipeSchema;
                }
            } catch (e) {
                // Ignore parse errors
            }
        });

        if (!jsonLdData) {
            console.log(`No JSON-LD found for ${url}`);
            return { success: false, error: "No structured data found" };
        }

        // Check if recipe already exists
        const existing = await db.recipe.findFirst({
            where: {
                sourceUrl: url,
                userId: userId
            }
        });

        if (existing) {
            return { success: true, status: "skipped", title: existing.title };
        }

        // Extract Data
        const title = jsonLdData.name || $("h1").text().trim();
        const description = jsonLdData.description || $('meta[name="description"]').attr("content") || "";

        // Clean ingredients
        const ingredients = Array.isArray(jsonLdData.recipeIngredient)
            ? jsonLdData.recipeIngredient.map((i: string) => i.replace(/^[\d½¼¾\.]+\s*-\s*/, "").trim()) // Remove leading " - " bullets often found
            : [];

        // Clean instructions
        let instructions: string[] = [];
        if (Array.isArray(jsonLdData.recipeInstructions)) {
            instructions = jsonLdData.recipeInstructions.map((i: any) => i.text || i.toString());
        }

        const prepTime = parseDuration(jsonLdData.prepTime);
        const cookTime = parseDuration(jsonLdData.cookTime) || parseDuration(jsonLdData.totalTime); // Fallback to total
        const servings = parseInt(jsonLdData.recipeYield?.toString() || "4") || 4;

        let imageUrl = jsonLdData.image;
        if (typeof imageUrl === 'object' && imageUrl.url) imageUrl = imageUrl.url;
        if (Array.isArray(imageUrl)) imageUrl = imageUrl[0];

        // Save
        await db.recipe.create({
            data: {
                userId,
                title,
                description,
                ingredients,
                instructions,
                prepTime,
                cookTime,
                servings,
                tags: ["Iform.dk", "Healthy"], // Default tags
                sourceUrl: url,
                imageUrl
            }
        });

        return { success: true, status: "created", title };

    } catch (error) {
        console.error(`Scrape failed for ${url}:`, error);
        return { success: false, error: "Failed to scrape" };
    }
}

export async function processIformPage(page: number) {
    const links = await crawlIformForLinks(page);
    console.log(`Found ${links.length} links on page ${page}`);

    const results = [];
    for (const link of links) {
        // Sequential to strictly avoid rate limiting issues on their end
        const res = await scrapeRecipeFromUrl(link);
        results.push({ url: link, ...res });

        // Tiny delay
        await new Promise(r => setTimeout(r, 500));
    }

    return {
        page,
        processed: results.length,
        results,
        hasMore: links.length > 0
    };
}
