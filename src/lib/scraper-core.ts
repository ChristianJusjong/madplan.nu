import * as cheerio from "cheerio";

export function parseDuration(iso: string | undefined | null): number {
    if (!iso) return 0;
    // Simple regex for PT1H30M format
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
}

export function normalizeInstructions(input: any): string[] {
    if (!input) return [];

    if (typeof input === "string") {
        // Splitting by newlines can be risky if formatted as a paragraph, 
        // but often necessary for unstructured text blocks.
        // We'll filter empty strings.
        return input.split(/\n+/).map(s => s.trim()).filter(s => s.length > 0);
    }

    if (Array.isArray(input)) {
        return input.map((step: any) => {
            if (typeof step === "string") return step.trim();
            if (step.text) return step.text.trim();
            if (step.name) return step.name.trim();
            if (step.itemListElement) {
                // Nested ItemList
                return normalizeInstructions(step.itemListElement).join(" ");
            }
            return "";
        }).filter((s: string) => s.length > 0);
    }

    return [];
}

export function findJsonLd($: cheerio.CheerioAPI): any {
    let recipeData: any = null;
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
            // Ignore parse errors used to find best match
        }
    });

    return recipeData;
}

export function extractImages(recipeData: any): string {
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
    return imageUrl;
}
