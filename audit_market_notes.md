# Market context notes

- News Tunisia article, “Why e-commerce is booming in Algeria” (2025), reports that Algeria's online retail market exceeded $1.5bn in 2024 and could surpass $2bn in 2025, citing Mezdad.com and UNCTAD. It also reports that roughly 75% of online purchases are made via smartphones, about 95% of transactions remain cash-on-delivery, internet penetration exceeded 72% by end-2023, and UNCTAD estimated B2C e-commerce at 0.8% of GDP in 2023. These figures are secondary reporting and should be framed as directional rather than audited facts.
- World Bank feature, “How Women Entrepreneurs in Algeria Are Going Digital” (2025), was opened as a second source for ecosystem context. The page did not render readable content in the sandbox browser, so no specific claim from it is used.
- Product implication: QuincaDZ should treat mobile-first UX, COD trust, delivery transparency, and merchant enablement as core product strategy rather than optional add-ons.
- No public QuincaDZ domain or stock ticker was identified in the repository; SimilarWeb and stock-analysis data are therefore not applicable without a live domain or company symbol.

Sources:
- https://news-tunisia.tunisienumerique.com/ecommerce-in-algeria-booming/
- https://www.worldbank.org/en/news/feature/2025/12/09/we-fi-feature-story-how-women-entrepreneurs-in-algeria-are-going-digital

## Runtime validation note

The public root route raised a server-side exception when local Supabase environment variables were absent, because it attempted to create a Supabase client before rendering anonymous content. The root route should tolerate missing auth configuration for local preview and render the public landing page; protected routes may still require configured Supabase credentials.
