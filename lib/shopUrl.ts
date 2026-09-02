// The last-visited /shop *grid* URL (with filters), tracked in
// sessionStorage. Only updated by the shop page itself. Used by the
// header's "Shop" nav link and the plant detail page's "Back to shop"
// link — both always say "Shop"/"Back to shop" and always mean the grid;
// neither one ever points at a specific plant page. (Returning to "the
// item you were just looking at" is a separate, genuine back-navigation
// action — see the cart page's back link, which uses real browser
// history instead of this tracking.)
export const LAST_SHOP_URL_KEY = "prairie-garden-last-shop-url";
