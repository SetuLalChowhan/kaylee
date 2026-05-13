# UI/Frontend Development Guide: Figma to React

This document outlines the standardized workflow and best practices for converting Figma designs into "pixel-perfect," performant, and maintainable frontend code.

---

## 1. Preparation & Design Analysis

Before writing any code, analyze the Figma file to identify:
- **Color Palette**: Identify Primary, Secondary, and Neutral colors (HEX/RGB/HSL).
- **Typography**: Check font families, weights, and sizes for headings and body text.
- **Spacing System**: Identify consistent margins, paddings (e.g., section-padding), and grid layouts.
- **Assets**: Export logos, icons (SVG), and images (WebP/PNG) in high resolution.

---

## 2. Infrastructure Setup (`index.css`)

Always start by defining global tokens in the CSS theme layer.

```css
@theme {
  /* Colors */
  --color-Primary: #005BD6;
  --color-Text: #1A1A1A;
  --color-Muted: #4F4F4F;

  /* Typography */
  --font-Main: 'Urbanist', sans-serif;

  /* Spacing Utility */
  .section-padding {
    @apply lg:px-[170px] px-4 lg:py-[120px] py-4;
  }
}
```

---

## 3. The Typography System

Avoid using ad-hoc text classes. Centralize typography in a `Typography.jsx` component.

| Component | Desktop Size | Purpose |
| :--- | :--- | :--- |
| `BannerTitle` | 64px - 72px | Hero section main headings. |
| `SectionHeader` | 40px | Secondary section headers. |
| `Subtext` | 24px | Descriptive text under headers. |
| `CardTitle` | 32px | Titles inside cards or small modules. |
| `CardPara` | 20px | Descriptions inside cards. |
| `Label` | 18px | Small pill badges or eyebrow text. |

---

## 4. Reusable UI Components

Build "Atomic" components first to ensure consistency across the app.

### Common Button / Link
Use a wrapper like `CommonButton.jsx` that handles both `<button>` and `<Link>` with the same styling.

### Cards
Place card components in a `cards/` subfolder within the section folder (e.g., `src/components/sites/home/cards/`).

---

## 5. Animation Strategy (Framer Motion)

Use `motion/react` for high-quality micro-interactions.
- **Entrance**: Use `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`.
- **Scroll Trigger**: Use `whileInView` for sections lower on the page.
- **Interactions**: Add `whileHover={{ scale: 1.05 }}` or `active:scale-95` to interactive elements.

---

## 6. Implementation Workflow

1.  **Global Layer**: Update `index.css` with theme variables and global utility classes.
2.  **Typography Layer**: Define the heading and text variants in `Typography.jsx`.
3.  **UI Layer**: Build common buttons, inputs, and layout wrappers.
4.  **Section Layer**: Create individual section files (e.g., `Banner.jsx`, `Workflow.jsx`).
5.  **Page Layer**: Assemble sections in the main page file (e.g., `Home.jsx`).

---

## 7. Responsive Best Practices

- **Mobile First**: Design for small screens first, then use `md:`, `lg:`, and `xl:` for larger viewports.
- **Flexible Grids**: Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for automatic layout shifts.
- **Fluid Spacing**: Use percentage-based widths or `max-w` containers to keep layouts centered and balanced.

---

## 8. Checklist for "Pixel Perfect" Results

- [ ] Does the font match the Figma file (e.g., Urbanist)?
- [ ] Are the colors pulled from the theme variables?
- [ ] Is the spacing consistent across all sections (`section-padding`)?
- [ ] Do images have proper overlays or shadows as designed?
- [ ] Is the top padding sufficient to clear the fixed navigation?
- [ ] Are animations smooth and non-distracting?
