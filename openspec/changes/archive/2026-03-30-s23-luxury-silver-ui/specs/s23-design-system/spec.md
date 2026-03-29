## ADDED Requirements

### Requirement: S23 CSS design tokens defined as custom properties
The system SHALL define all S23 Luxury Silver tokens as CSS custom properties in `globals.css` so that all UI components reference a single token source.

#### Scenario: Token variables present in stylesheet
- **WHEN** the application loads
- **THEN** the root element SHALL expose `--color-bg-primary`, `--color-bg-secondary`, `--color-text-primary`, `--color-brand-primary`, `--color-brand-accent`, `--radius-sm`, and `--shadow-silver` as CSS custom properties with S23 values

### Requirement: Tailwind config maps S23 tokens to utility classes
The Tailwind config SHALL extend the theme with color aliases, box-shadow, border-radius, and font-family entries that reference the S23 CSS variables.

#### Scenario: S23 utility classes available
- **WHEN** a component uses `text-silver-text`, `bg-silver-bg`, `bg-silver-surface`, `bg-silver-brand`, `bg-silver-accent`, `shadow-silver`, or `font-sans`
- **THEN** the correct S23 token values are applied

### Requirement: Montserrat loaded as the primary font
The layout SHALL load Montserrat (weights 300, 400, 600) from Google Fonts and apply it as the default sans-serif font.

#### Scenario: Montserrat applied to all text
- **WHEN** the application renders any text node
- **THEN** the computed font-family SHALL be Montserrat
