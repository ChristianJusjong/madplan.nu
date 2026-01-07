export function cleanJsonResponse(response: string): string {
    return response.replace(/```json/g, "").replace(/```/g, "").trim();
}
