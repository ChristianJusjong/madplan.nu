"use server";

import * as cheerio from "cheerio";
import { db } from "@/lib/db";
import { SUPPORTED_SITES, SiteConfig } from "@/lib/scraper-config";
import { revalidatePath } from "next/cache";
import { Gender, ActivityLevel, Goal } from "@prisma/client";
import { findJsonLd, normalizeInstructions, extractImages, parseDuration } from "@/lib/scraper-core";

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

        let recipeData = findJsonLd($);

        if (!recipeData) {
            return { success: false, message: "No structured recipe data found" };
        }

        // Map extracted data to our schema
        const title = recipeData.name || $("title").text();
        const description = recipeData.description || "";
        const cleanDescription = description.replace(/<[^>]*>/g, "").slice(0, 500); // Strip HTML, limit length

        const instructions = normalizeInstructions(recipeData.recipeInstructions);

        // Ingredients
        let ingredients: string[] = [];
        if (Array.isArray(recipeData.recipeIngredient)) {
            ingredients = recipeData.recipeIngredient;
        }

        const imageUrl = extractImages(recipeData);

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
