# Design system: QuincaDZ

## 1. Visual theme and atmosphere

QuincaDZ should feel like a **local construction catalog rebuilt for the phone**: practical, trustworthy, and visibly connected to real stores rather than abstract platform software. The dominant direction is **Swiss-industrial print with warm utility**. It uses a paper-like canvas, charcoal ink, a single construction-orange accent, and deliberate structural lines. The interface should be calm enough for first-time shoppers but precise enough for merchants managing inventory and orders.

The target dials are **variance 6**, **motion 4**, and **density 5**. Marketing surfaces can use asymmetry and generous whitespace; operational screens should become more compact and use dividers instead of decorative card stacks.

## 2. Color palette and roles

| Token | Hex | Role |
|---|---|---|
| Paper canvas | `#F7F6F3` | Global page background and quiet surfaces |
| White surface | `#FFFFFF` | Forms, product surfaces, and elevated work areas |
| Charcoal ink | `#171717` | Main text, headings, navigation, and strong rules |
| Muted stone | `#6F6D68` | Secondary text, metadata, helper copy |
| Structural line | `#E4E1DC` | Dividers, borders, table rules, and input outlines |
| Construction orange | `#D96B27` | The single accent for primary actions, active states, and marketplace markers |
| Accent dark | `#B75419` | Hover state and pressed state for the orange action |
| Quiet success | `#2F6F4E` | Inventory availability and completed states only |

Do not introduce a second brand accent. Do not use neon gradients, purple-blue AI gradients, pure black, or large saturated color fields. Status colors are semantic and should not become decorative brand colors.

## 3. Typography rules

Arabic remains the primary product language and must be treated as a first-class layout mode. Use **Cairo** for Arabic and Latin UI copy because it is already loaded by the application and has strong Arabic legibility. Use a monospace face such as `ui-monospace` for order numbers, stock counts, timestamps, and small technical labels.

Headings use tight tracking, controlled scale, and sentence case. Body copy should remain within approximately 65 characters per line where possible, with relaxed leading. Prices and quantities should use tabular figures or monospace treatment so columns do not jump while values change. Avoid all-caps for ordinary user copy; reserve uppercase technical labels for catalog identifiers and operational metadata.

## 4. Layout principles

The public landing page uses an asymmetric editorial grid: narrative content occupies the larger column and a catalog-like visual block anchors the other side. Marketplace pages use a four-column product grid on large screens, two columns on tablet, and a single-column flow on small screens. Merchant and admin surfaces should prefer top-level sections, horizontal rules, and compact data tables over repeated floating cards.

All content is contained within a maximum width of approximately 1280px. Touch targets are at least 44px. Full-height experiences use `min-height: 100dvh`. Below 768px, asymmetric layouts collapse to one column, side panels become inline sections, and no decorative overlap may create horizontal scrolling.

## 5. Component styling

**Primary buttons** are compact rectangular actions with a 6px radius, orange fill, white text, and a tactile one-pixel press. **Secondary actions** use white fill with a structural line and charcoal text. Tertiary actions should be text links with the orange accent; do not make every action a pill.

**Product cards** use a single crisp border and a generous image area. Elevation is communicated by whitespace and a very soft tinted shadow on hover, not by heavy gray shadows. Product imagery should use consistent cropping and descriptive alt text. Stock labels are small rounded status badges; the badge is allowed to be pill-shaped because it is a compact status primitive, not a container.

**Forms** place labels above inputs, keep helper or error text below, and use an orange focus ring. Validation is inline and specific. Blocking browser alerts are not part of the experience. Loading states use layout-matched skeletons; empty states explain how to add or find the first item; error states explain what failed and provide a recoverable action.

**Navigation** keeps the active route visibly selected. On mobile, the menu is a right-side sheet with a scrim, clear close control, preserved focus order, and a visible route marker. The cart count is an accessible live status and should not be the only signal that an item was added.

## 6. Motion and interaction

Motion is restrained and purposeful. Use 180–300ms transitions with a smooth cubic-bezier curve. Animate only opacity and transforms. Major blocks may enter with a small fade-up; operational tables should remain stable and avoid theatrical motion. Respect `prefers-reduced-motion` by removing entry animations and transform effects.

Every interactive control must have hover, focus-visible, active, disabled, and loading states when applicable. Do not use custom cursors, infinite decorative motion, or background effects that trigger continuous GPU work on scrolling containers.

## 7. Mobile product direction

The future mobile experience should be **cross-platform premium neutral**, with one coherent design system rather than a phone-sized desktop site. The first screen should prioritize nearby categories, delivery area, search, and recently viewed items. The primary navigation should be a clear bottom tab bar for Browse, Cart, Orders, and Profile. Store pages should become task-focused flows for stock updates, order confirmation, and delivery handoff.

The most important mobile design constraints are readable prices, large tap targets, safe-area spacing, short forms, and visible order status. Do not compress dense catalog data into tiny text or use decorative dashboard charts unless they change a merchant decision.

## 8. Anti-patterns

Never use Inter, generic startup gradients, pure black, emoji as product icons, dead `#` links, fake round metrics, generic names, or copy such as “seamless,” “next-gen,” and “unleash.” Never use three equal feature cards as the default marketing structure, never hide errors in alerts, never make the checkout rely on anonymous client-side multi-step writes as the long-term transaction boundary, and never ship a marketplace page without an empty state, a loading state, and a failure state.
