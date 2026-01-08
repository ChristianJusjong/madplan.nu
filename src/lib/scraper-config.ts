
export interface SiteConfig {
    name: string;
    baseUrl: string;
    recipeLinkSelector: string;
    paginationSelector: string;
    urlPattern: RegExp;
    jsonLd: boolean;
}

export const SUPPORTED_SITES: Record<string, SiteConfig> = {
    iform: {
        name: "Iform",
        baseUrl: "https://iform.dk/sunde-opskrifter",
        recipeLinkSelector: "a.teaser__link", // Updated from browser inspection
        paginationSelector: ".paginator__link",
        urlPattern: /iform\.dk\/(sunde-opskrifter|opskrifter)\/.+/,
        jsonLd: true
    },
    mummum: {
        name: "Mummum",
        baseUrl: "https://mummum.dk/opskrifter/sundere-alternativer/",
        recipeLinkSelector: "article a, .post-item a",
        paginationSelector: ".pagination, .nav-links",
        urlPattern: /mummum\.dk\/(?!kategori|opskrifter|sundere-alternativer).+/, // Avoid category pages in recipe detection if possible
        jsonLd: true
    },
    gourministeriet: {
        name: "Gourministeriet",
        baseUrl: "https://gourministeriet.dk/kategori/sunde-opskrifter/",
        recipeLinkSelector: ".readmore_button a, article a.more-link",
        paginationSelector: ".page-numbers, .pagination",
        urlPattern: /gourministeriet\.dk\/(?!kategori|page).+/,
        jsonLd: true
    }
};
