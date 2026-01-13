import { getPantryItems } from "@/actions/pantry";
import PantryPageClient from "@/components/PantryPageClient";

export default async function Page() {
    const items = await getPantryItems();
    return <PantryPageClient items={items} />;
}
