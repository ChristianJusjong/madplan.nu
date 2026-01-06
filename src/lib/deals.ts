export interface Deal {
    brand: string;
    description: string;
    price: number;
    currency: string;
    store: string;
    validFrom: string;
    validTo: string;
}

export async function getWeeklyDeals(): Promise<string> {
    const apiKey = process.env.TJEK_API_KEY;

    if (!apiKey) {
        console.warn("TJEK_API_KEY not found. Using mock deals.");
        return getMockDeals();
    }

    try {
        const response = await fetch("https://api.etilbudsavis.dk/v2/offers?limit=50&r_lat=55.6761&r_lng=12.5683&r_radius=5000", {
            headers: {
                "X-Api-Key": apiKey,
                "Accept": "application/json"
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const deals: Deal[] = data.map((offer: any) => ({
            brand: offer.branding?.name || "Unknown Brand",
            description: offer.heading || offer.description || "No description",
            price: offer.pricing?.price || 0,
            currency: offer.pricing?.currency || "DKK",
            store: offer.business?.name || "Unknown Store",
            validFrom: offer.run_from,
            validTo: offer.run_till
        }));

        return formatDealsForPrompt(deals);

    } catch (error) {
        console.error("Failed to fetch deals from API:", error);
        return getMockDeals();
    }
}

function getMockDeals(): string {
    return `
    Netto Deals:
    - Minced Beef 500g: 30 DKK
    - Organic Carrots 2kg: 10 DKK
    - Free Range Eggs 10pcs: 18 DKK
    - Chicken Breast 450g: 25 DKK
    
    Rema1000 Deals:
    - Jasmine Rice 1kg: 12 DKK
    - Broccoli: 8 DKK
    - Tuna cans (3-pack): 15 DKK
    - Oatmeal 1kg: 10 DKK
    - Milk 1L: 11 DKK
    
    Bilka Deals:
    - Salmon Fillet 125g: 20 DKK
    - Frozen Spinach 400g: 12 DKK
    - Pasta 1kg: 10 DKK
    `;
}

function formatDealsForPrompt(deals: Deal[]): string {
    // Group by store for cleaner output
    const dealsByStore: Record<string, Deal[]> = {};

    deals.forEach(deal => {
        if (!dealsByStore[deal.store]) {
            dealsByStore[deal.store] = [];
        }
        dealsByStore[deal.store].push(deal);
    });

    let output = "";
    for (const [store, storeDeals] of Object.entries(dealsByStore)) {
        output += `${store} Deals:\n`;
        // Limit to top 10 deals per store to save tokens
        storeDeals.slice(0, 10).forEach(deal => {
            output += `- ${deal.description} (${deal.brand}): ${deal.price} ${deal.currency}\n`;
        });
        output += "\n";
    }

    return output;
}
