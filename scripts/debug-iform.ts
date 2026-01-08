
import * as cheerio from "cheerio";
import * as fs from "fs";

async function run() {
    const url = "https://iform.dk/sunde-opskrifter";
    console.log(`Fetching ${url}...`);

    // Use the browser UA
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });

    const html = await res.text();
    console.log(`Fetched ${html.length} bytes.`);

    fs.writeFileSync("iform-dump.html", html);
    console.log("Saved to iform-dump.html");

    const $ = cheerio.load(html);

    const allLinks = $("a");
    console.log(`Total 'a' tags: ${allLinks.length}`);

    // Print first 20 links to see structure
    allLinks.slice(0, 20).each((i, el) => {
        console.log(`Link ${i}: class="${$(el).attr("class")}" href="${$(el).attr("href")}"`);
    });

    // Try to find a known recipe link part
    const knownPart = "cremet-linsesuppe"; // Example from before
    const specific = $(`a[href*="${knownPart}"]`);
    if (specific.length > 0) {
        console.log(`\nFound specific link!`);
        console.log(specific.parent().html());
        console.log(`Classes: ${specific.attr("class")}`);
    } else {
        console.log(`\nDid not find link containing '${knownPart}'`);
        // Search for *any* /sunde-opskrifter link
        const anyRecipe = $(`a[href*="/sunde-opskrifter/"]`);
        console.log(`Found ${anyRecipe.length} links with /sunde-opskrifter/`);
        anyRecipe.slice(0, 5).each((i, el) => {
            console.log(`Potential Recipe: ${$(el).attr("href")} | Class: ${$(el).attr("class")}`);
        });
    }
}

run().catch(console.error);
