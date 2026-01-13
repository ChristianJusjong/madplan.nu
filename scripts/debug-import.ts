
import { Groq } from "groq-sdk";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = new PrismaClient();
const userId = "test-debug-user";

function cleanJsonResponse(response: string): string {
    return response.replace(/```json/g, "").replace(/```/g, "").trim();
}

async function debugImport(url: string) {
    console.log(`Debug importing: ${url}`);

    try {
        // 1. Fetch HTML
        console.log("Fetching HTML...");
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MadplanBot/1.0)" } });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const html = await res.text();
        const truncatedHtml = html.substring(0, 50000);
        console.log(`Fetched ${html.length} chars (truncated to 50k)`);

        // 2. AI Parsing
        console.log("Calling Groq...");
        if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const prompt = `
            EXTRACT RECIPE FROM HTML.
            URL: ${url}
            HTML: ${truncatedHtml}
            
            OUTPUT JSON ONLY:
            {
                "title": "Recipe Title",
                "description": "Short description",
                "ingredients": ["500g Chicken", "2 onions"],
                "instructions": ["Step 1: Chop onions...", "Step 2: Fry..."],
                "prepTime": 15, // minutes
                "cookTime": 30, // minutes
                "servings": 4, // integer
                "tags": ["Dinner", "Chicken"]
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("AI extraction failed");

        console.log("AI Response received. Parsing...");
        const data = JSON.parse(cleanJsonResponse(content));
        console.log("Parsed Data:", JSON.stringify(data, null, 2));

        // 3. Save to DB (Where I suspect the error is)
        console.log("Saving to DB...");

        // Emulate the logic in actions/recipes.ts
        const recipeData = {
            userId,
            title: data.title || "Untitled Recipe",
            description: data.description,
            ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
            instructions: Array.isArray(data.instructions) ? data.instructions : [], // This is where we changed logic
            prepTime: data.prepTime || 0,
            cookTime: data.cookTime || 0,
            servings: data.servings || 4,
            tags: data.tags || [],
            sourceUrl: url,
        };

        const result = await db.recipe.create({
            data: recipeData
        });

        console.log("SUCCESS! Created recipe:", result.id);

    } catch (error) {
        console.error("\nERROR DETAILS:");
        console.error(error);
    } finally {
        await db.$disconnect();
    }
}

// Ensure at least one arg
const url = process.argv[2] || "https://www.valdemarsro.dk/stenalderbroed/";
debugImport(url);
