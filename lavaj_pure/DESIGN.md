# Design System Document: Editorial Renewal

## 1. Overview & Creative North Star
**Creative North Star: "The Pristine Utility"**

This design system rejects the "cluttered marketplace" aesthetic common in budget-friendly retail. Instead, it adopts a high-end editorial approach—treating refurbished appliances with the same dignity as luxury goods. We achieve "Trustworthy" not through heavy borders and loud banners, but through **Pristine Utility**: an ultra-clean, rhythmic layout characterized by breathable white space, intentional asymmetry, and sophisticated tonal layering. 

By utilizing high-contrast typography and oversized touch targets, we ensure absolute accessibility for classes C, D, and E, while the "Water & Leaf" organic motifs are integrated through subtle glassmorphism and fluid background transitions rather than literal clip-art.

---

## 2. Colors & Surface Architecture

The palette is rooted in nature and reliability. We move beyond flat blocks of color by utilizing a sophisticated Material-based tonal scale.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or containers. Separation must be achieved exclusively through background color shifts. 
*   *Example:* A product grid sitting on `surface` (#f9f9f9) should be contained within a `surface-container-low` (#f3f3f3) zone.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of materials. 
*   **Base Layer:** `surface` (#f9f9f9) for the primary page background.
*   **Content Zones:** `surface-container` (#eeeeee) for secondary information blocks.
*   **Prominent Cards:** `surface-container-lowest` (#ffffff) to make product cards "pop" against a slightly darker background.

### Signature Textures & The "Glass" Rule
To evoke the "Water" element, use **Glassmorphism** for floating headers or navigation bars. Use semi-transparent `surface` colors with a 12px-20px `backdrop-blur`. 
*   **Gradients:** Use a subtle linear gradient from `primary` (#0d631b) to `primary_container` (#2e7d32) on hero sections to provide a "liquid" depth that feels premium and polished.

---

## 3. Typography: The Editorial Voice

We use **Inter** not as a system font, but as a bold architectural tool. High contrast between scales is the key to accessibility and hierarchy.

*   **Display (The Hook):** `display-md` (2.75rem). Used for value propositions (e.g., "Like New, For Less").
*   **Headline (The Authority):** `headline-sm` (1.5rem). Used for section titles.
*   **Title (The Product):** `title-lg` (1.375rem). Used for product names and primary headings in cards.
*   **Body (The Clarity):** `body-lg` (1rem / 16px). This is the workhorse. Ensure a line-height of 1.6 for maximum readability.
*   **Price Highlight:** Use `headline-md` (1.75rem) or larger in `error` (#ba1a1a) for price points. It must be the most visually heavy element on the page.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often messy. We define depth through light and tone.

*   **The Layering Principle:** Instead of shadows, stack `surface-container-lowest` (#ffffff) on top of `surface-container-high` (#e8e8e8). This creates a "clean room" feel appropriate for refurbished goods.
*   **Ambient Shadows:** If a floating action (like a "Buy Now" button) requires a shadow, use a 24px blur with 6% opacity using the `on-surface` (#1a1c1c) color. It should feel like a soft glow, not a dark smudge.
*   **The Ghost Border:** If a boundary is legally or functionally required, use `outline_variant` at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: Intentional Primitives

### Buttons (The "Touch-First" Philosophy)
*   **Primary:** `primary` (#0d631b) background with `on_primary` (#ffffff) text. 
    *   *Styling:* `xl` roundedness (1.5rem), minimum height 56px.
*   **Secondary (CTA):** `tertiary` (#903c00/Orange) for high-conversion moments like "Add to Cart."
*   **Tertiary:** No background. Use `primary` text with a `surface-variant` hover state.

### Product Cards
*   **Structure:** No borders. Use `surface-container-lowest` background. 
*   **Layout:** Image takes up 60% of the vertical space. 
*   **Spacing:** Use `spacing-6` (1.5rem) internal padding to ensure the product "breathes."

### Input Fields
*   **Style:** Filled backgrounds using `surface-container-highest` (#e2e2e2) with a `primary` 2px bottom-indicator on focus. 
*   **Labels:** Always visible using `label-md`. Never use placeholder text as a label.

### Iconic Signifiers
Icons must be "Bold & Simple" (2px stroke minimum).
*   **Warranty:** Shield icon using `secondary` (#005db7).
*   **Delivery:** Truck icon using `tertiary` (#903c00).
*   **Ecology:** Leaf icon using `primary` (#0d631b).

---

## 6. Do's and Don'ts

### Do
*   **DO** use white space as a structural element. If in doubt, add more padding.
*   **DO** use the `24` (6rem) spacing token between major vertical sections to create an editorial rhythm.
*   **DO** use high-quality photography of "clean surfaces" to reinforce the refurbished quality.
*   **DO** ensure all text-on-background combinations meet WCAG AAA standards.

### Don't
*   **DON'T** use 1px dividers. Use a `spacing-8` gap or a background color shift instead.
*   **DON'T** use "Pure Black" (#000000). Always use `on_surface` (#1a1c1c) for text to maintain a premium feel.
*   **DON'T** cram information. If a card feels full, move secondary details to a "View Details" expansion.
*   **DON'T** use sharp corners. Every element must use at least the `md` (0.75rem) roundedness scale to feel approachable.