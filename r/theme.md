# opencommerce theme
The opencommerce tokens and the Tailwind names that read them.

Install: npx opencommerce-ds add theme
Requires: none
Packages: none
Exports: See source
Client boundary: not required by this entry file

## Usage



## Source

styles/tokens.css

```css
/* Written by opencommerce-ds from its brand files. Do not edit; run the CLI again to update. */
:root {
	/* Core: one bright blue, one deep blue, one ink, one sky, and white. Every other color is one of these mixed toward
	   another at a stated percentage, written out solid. */
	--ds-color-brand: #2E3AE8;
	--ds-color-black: #000000;
	--ds-color-white: #FFFFFF;
	--ds-color-ink: #171818;
	--ds-color-paper: #F9F9F9;
	--ds-color-sky: #CCDBFF;
	/* The blue mixed toward ink (a key's edge), toward white (a key's hover) and very pale (a highlighted row). */
	--ds-color-blue-edge: #2830AE;
	--ds-color-blue-hover: #4752EB;
	--ds-color-blue-5: #F0F1FD;
	--ds-color-blue-10: #EAEBFD;
	--ds-color-blue-mid: #1520B8;
	--ds-color-blue-mist: #F0F1FD;
	--ds-color-sky-wash: #F9F9F9;
	--ds-color-bg-search-selected: #F0F1FD;
	/* The two wave blues (decoration only, never under text), the one warm accent, and pale window tints. */
	--ds-color-neon: #4DB8FF;
	--ds-color-electric: #050EF4;
	--ds-color-heart: #F24656;
	--ds-color-tint-sage: #CFE3C9;
	--ds-color-tint-rose: #EFCFD3;
	--ds-color-tint-teal: #C6DFE2;
	--ds-color-tint-peach: #F1D8C6;
	--ds-color-tint-butter: #ECE3C0;

	/* Surfaces: one white page; mist (ink at 2.5 percent) for window bars, insets, table heads and the closing card. */
	--ds-color-bg-default: #FFFFFF;
	--ds-color-bg-page: #FFFFFF;
	--ds-color-bg-subtle: #F9F9F9;
	--ds-color-bg-frame: #F9F9F9;
	--ds-color-bg-canvas: #FFFFFF;
	--ds-color-bg-tint: #F0F1FD;
	--ds-color-bg-brand: #2E3AE8;
	--ds-color-bg-inverse: #171818;
	--ds-color-bg-dark: #171818;
	--ds-color-bg-code: #171818;
	--ds-color-bg-scrim: rgb(23 24 24 / 0.4);
	--ds-color-bg-glass: rgb(255 255 255 / 0.72);
	/* A note in a guide: the pale blue. */
	--ds-color-bg-note: #F0F1FD;
	/* A banded line in a dark code window: white at 5 percent on ink. */
	--ds-color-bg-code-soft: #232424;
	--ds-color-bg-raised-on-brand: rgb(255 255 255 / 0.07);

	/* Text: ink, then ink at 64 percent (secondary copy, AA on white) and 42 percent (hints), solid so they read the
	   same on any white; white on the blue and on code. */
	--ds-color-text-default: #171818;
	--ds-color-text-secondary: #6B6B6B;
	--ds-color-text-muted: #6B6B6B;
	--ds-color-text-subtle: #6B6B6B;
	--ds-color-text-nav: #6B6B6B;
	--ds-color-text-faint: #9E9E9E;
	--ds-color-text-inverse: #FFFFFF;
	--ds-color-text-brand: #2E3AE8;
	--ds-color-text-on-brand: #FFFFFF;
	--ds-color-text-on-brand-muted: rgb(255 255 255 / 0.72);
	--ds-color-text-label: #2E3AE8;
	--ds-color-text-on-brand-label: #CCDBFF;
	/* Code on ink: white at 88 percent, keywords the blue lifted toward white, strings sky, comments white at 40. */
	--ds-color-text-code: #E3E3E3;
	--ds-color-text-code-key: #A1A6F5;
	--ds-color-text-code-string: #CCDBFF;
	--ds-color-text-code-dim: #747474;
	/* Strings in light code: the deep blue. */
	--ds-color-text-string: #1520B8;

	/* Lines: ink at 9 percent for every divider, 16 for the edges of windows, keys and fields. */
	--ds-color-border-default: #EAEAEA;
	--ds-color-border-subtle: #EAEAEA;
	--ds-color-border-strong: #DADADA;
	--ds-color-border-mid: #DADADA;
	--ds-color-border-rule: #EAEAEA;
	--ds-color-border-field: #DADADA;
	--ds-color-border-field-hover: rgb(23 24 24 / 0.28);
	--ds-color-border-hairline: #DADADA;
	/* A white key's edge: the hairline, kept when a blue ground re-points the hairline to white. */
	--ds-color-border-key: #DADADA;
	--ds-color-border-brand: #2E3AE8;
	--ds-color-border-brand-edge: #2830AE;
	--ds-color-border-on-brand: rgb(255 255 255 / 0.22);
	--ds-color-border-on-brand-strong: rgb(255 255 255 / 0.45);
	--ds-color-border-window: #DADADA;
	/* The edge of glass (the header's trays) and of a control on ink. */
	--ds-color-border-glass: rgb(23 24 24 / 0.1);
	--ds-color-border-on-code: rgb(255 255 255 / 0.15);
	--ds-color-border-on-code-hover: rgb(255 255 255 / 0.3);
	--ds-color-wash-hover: rgb(23 24 24 / 0.05);
	--ds-color-wash-pill: rgb(23 24 24 / 0.07);
	--ds-color-wash-selected: rgb(46 58 232 / 0.07);
	--ds-color-wash-on-brand: rgb(255 255 255 / 0.14);
	--ds-color-wash-glass-hover: rgb(23 24 24 / 0.05);
	--ds-color-ring-tint: rgb(46 58 232 / 0.2);

	/* Actions and states. The main action is the blue key; the second is the white key. */
	--ds-color-action-primary: #2E3AE8;
	--ds-color-action-primary-hover: #4752EB;
	--ds-color-action-primary-fg: #FFFFFF;
	--ds-color-status-success: #15803D;
	--ds-color-status-warning: #B45309;
	--ds-color-status-danger: #D92D3F;
	--ds-color-focus-ring: #2E3AE8;
	--ds-color-chart-series-1: #2E3AE8;
	--ds-color-chart-series-2: #1520B8;
	--ds-color-chart-series-3: #4DB8FF;
	--ds-color-chart-series-4: #CCDBFF;
	/* The window: a quiet title bar in mist, its name in muted mono and the [*] in blue. */
	--ds-color-window-bar: #F9F9F9;
	--ds-color-window-bar-fg: #2E3AE8;

	/* Type: Inter for text, buttons and links; Neue Haas Grotesk Display (Helvetica Neue where it is not installed)
	   for headings and the wordmark; the platform mono for code, window bars, tags and figures in tables. Display
	   type is 500 and tracked tight; nothing is bold. */
	--ds-font-sans: var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif;
	--ds-font-display: "Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
	--ds-font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
	/* Code in the guides' code blocks: the same platform mono. */
	--ds-font-code: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
	--ds-font-weight-regular: 400;
	--ds-font-weight-medium: 500;
	/* Headings, buttons and the wordmark are set at 500. */
	--ds-font-weight-heading: 500;
	/* The footer's wordmark: the name set as large as the page allows. */
	--ds-text-display: 12.5rem;
	--ds-text-hero: 3.375rem;
	--ds-text-h1: 3rem;
	--ds-text-h2: 2.75rem;
	--ds-text-h3: 1.5rem;
	--ds-text-h4: 1.25rem;
	--ds-text-h5: 1.0625rem;
	--ds-text-body-lg: 1rem;
	--ds-text-body: 1rem;
	--ds-text-button: 0.9375rem;
	--ds-text-body-sm: 0.875rem;
	--ds-text-snippet: 0.8125rem;
	--ds-text-caption: 0.75rem;
	--ds-text-bar: 0.71875rem;
	--ds-text-micro: 0.625rem;
	--ds-leading-tight: 1;
	--ds-leading-heading: 1.02;
	--ds-leading-display: 1.06;
	--ds-leading-snug: 1.2;
	--ds-leading-lead: 1.55;
	--ds-leading-body: 1.6;
	--ds-leading-relaxed: 1.625;
	--ds-leading-code: 1.75;
	--ds-tracking-display: -0.05em;
	--ds-tracking-hero: -0.03em;
	--ds-tracking-tighter: -0.025em;
	--ds-tracking-tight: -0.02em;
	--ds-tracking-snug: -0.01em;
	--ds-tracking-normal: 0;
	--ds-tracking-label: 0;
	/* Caps on a small tag, and the arrow in a window bar. */
	--ds-tracking-caps: 0.08em;
	--ds-tracking-mark: 0.3em;

	/* Space (rem, so it follows the root) */
	--ds-space-0: 0;
	--ds-space-px: 1px;
	--ds-space-0-5: 0.125rem;
	--ds-space-1: 0.25rem;
	--ds-space-1-5: 0.375rem;
	--ds-space-2: 0.5rem;
	--ds-space-2-5: 0.625rem;
	--ds-space-3: 0.75rem;
	--ds-space-3-5: 0.875rem;
	--ds-space-4: 1rem;
	--ds-space-4-5: 1.125rem;
	--ds-space-5: 1.25rem;
	--ds-space-6: 1.5rem;
	--ds-space-7: 1.75rem;
	--ds-space-8: 2rem;
	--ds-space-9: 2.25rem;
	--ds-space-10: 2.5rem;
	--ds-space-12: 3rem;
	--ds-space-14: 3.5rem;
	--ds-space-16: 4rem;
	--ds-space-20: 5rem;
	--ds-space-24: 6rem;
	--ds-space-28: 7rem;
	--ds-space-30: 7.5rem;
	--ds-space-32: 8rem;

	/* Layout: a 1200px frame with 40px of gutter (20px on phones); most sections sit in the 800px medium column, the
	   wide ones (a live table, a step-by-step, the closing card) take the whole frame. Headings narrow to 672px, their
	   description to 576px. */
	--ds-layout-column: 75rem;
	--ds-layout-medium: 50rem;
	--ds-layout-gutter: 2.5rem;
	--ds-layout-text: 36rem;
	--ds-layout-heading: 42rem;
	--ds-layout-header: 4rem;
	/* The content column: 1200px less the gutter on each side. Containers use it. */
	--ds-frame-column: min(100% - 2 * var(--ds-layout-gutter), var(--ds-layout-column) - 2 * var(--ds-layout-gutter));

	/* Shape: nearly square chrome. 2px tags, 5px nav links, 6px cards and small keys, 8px buttons and fields, 12px
	   windows, 16px for the closing card. */
	--ds-radius-chip: 2px;
	--ds-radius-sm: 0.375rem;
	--ds-radius-menu: 0.3125rem;
	--ds-radius-control: 0.5rem;
	--ds-radius-card: 0.375rem;
	--ds-radius-panel: 0.75rem;
	--ds-radius-shell: 1rem;
	--ds-radius-pill: 9999px;
	/* Keys are flat: no lit edge and no drop, only a border a shade darker than the fill. A press shrinks a key a touch
	   rather than sinking it. The names stay so every key reads them in one place. */
	--ds-shadow-key: none;
	--ds-shadow-key-brand: none;
	--ds-shadow-key-muted: none;
	--ds-shadow-pressed: none;
	/* A sunken track (a segmented control's well). */
	--ds-shadow-well: inset 0 1px 2px rgb(23 24 24 / 0.06);
	/* The guides' windows: the window's soft drop. */
	--ds-shadow-guide: 0 1px 2px rgb(23 24 24 / 0.04), 0 12px 32px -20px rgb(23 24 24 / 0.22);
	/* A search field's faint inner shadow. */
	--ds-shadow-inset: inset 0 1px 2px rgb(23 24 24 / 0.04);
	/* Windows and cards: a hairline drop and a long soft one below. */
	--ds-shadow-card: 0 1px 2px rgb(23 24 24 / 0.04), 0 12px 32px -20px rgb(23 24 24 / 0.22);
	/* A small card set on a picture (an order card): a firmer drop. */
	--ds-shadow-raised: 0 1px 2px rgb(23 24 24 / 0.08), 0 12px 28px -20px rgb(23 24 24 / 0.4);
	/* The dark code box (install): its drop. */
	--ds-shadow-code: 0 12px 32px -20px rgb(23 24 24 / 0.45);
	--ds-shadow-plan: 0 1px 2px rgb(23 24 24 / 0.04), 0 12px 32px -20px rgb(23 24 24 / 0.22);
	--ds-shadow-tile: 0 1px 2px rgb(23 24 24 / 0.08);
	/* Glass: the header's trays (a lit top edge, flat on the page) and menus that float. */
	--ds-shadow-glass: inset 0 1px 0 rgb(255 255 255 / 0.9);
	--ds-shadow-floating: 0 1px 2px rgb(23 24 24 / 0.06), 0 12px 32px -16px rgb(23 24 24 / 0.28);
	/* The lit pill in the header's tray: a hairline and a small lift. */
	--ds-shadow-lit: 0 0 0.5px rgb(23 24 24 / 0.22), 0 1px 1.5px rgb(23 24 24 / 0.14);
	--ds-shadow-glass-hover: 0 0 0.5px rgb(23 24 24 / 0.22), 0 1px 1.5px rgb(23 24 24 / 0.14);
	--ds-shadow-tooltip: 0 1px 2px rgb(23 24 24 / 0.1), 0 8px 24px rgb(23 24 24 / 0.12);
	/* A lit tile's ring (the store that is being bought from). */
	--ds-shadow-ring-hover: 0 0 0 3px rgb(46 58 232 / 0.14);
	--ds-glass-sheen: linear-gradient(180deg, rgb(255 255 255 / 0.6), transparent 70%);
	--ds-glass-blur: blur(16px) saturate(1.4);

	/* The band divider: four 9px steps between two grounds, each a further mix toward the ground below. */
	--ds-band-step: 9px;
	--ds-band-mix-1: 24%;
	--ds-band-mix-2: 48%;
	--ds-band-mix-3: 70%;
	--ds-band-mix-4: 88%;

	/* Motion: a strong ease-out for every hover, press and entrance; in-out only for what travels and stays on screen
	   (the header's trays, the nav pill); a small overshoot only for a badge or a tick that pops in. Never ease-in. */
	--ds-duration-fast: 160ms;
	--ds-duration-base: 200ms;
	--ds-duration-moderate: 250ms;
	--ds-duration-slow: 300ms;
	--ds-easing-out: cubic-bezier(0.22, 1, 0.36, 1);
	--ds-easing-in-out: cubic-bezier(0.77, 0, 0.175, 1);
	--ds-easing-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
}

```

styles/theme.css

```css
/* Written by opencommerce-ds from its brand files. Do not edit; run the CLI again to update. */
@theme inline {
	--color-brand: var(--ds-color-brand);
	--color-black: var(--ds-color-black);
	--color-white: var(--ds-color-white);
	--color-primary: var(--ds-color-action-primary);
	--color-primary-hover: var(--ds-color-action-primary-hover);
	--color-on-primary: var(--ds-color-action-primary-fg);
	--color-focus-ring: var(--ds-color-focus-ring);
	--color-surface: var(--ds-color-bg-default);
	--color-subtle: var(--ds-color-bg-subtle);
	--color-frame: var(--ds-color-bg-frame);
	--color-canvas: var(--ds-color-bg-canvas);
	--color-tint: var(--ds-color-bg-tint);
	--color-inverse: var(--ds-color-bg-inverse);
	--color-dark: var(--ds-color-bg-dark);
	--color-code: var(--ds-color-bg-code);
	--color-scrim: var(--ds-color-bg-scrim);
	--color-fg: var(--ds-color-text-default);
	--color-fg-secondary: var(--ds-color-text-secondary);
	--color-fg-muted: var(--ds-color-text-muted);
	--color-fg-subtle: var(--ds-color-text-subtle);
	--color-fg-faint: var(--ds-color-text-faint);
	--color-fg-nav: var(--ds-color-text-nav);
	--color-fg-inverse: var(--ds-color-text-inverse);
	--color-fg-brand: var(--ds-color-text-brand);
	--color-on-brand: var(--ds-color-text-on-brand);
	--color-line: var(--ds-color-border-default);
	--color-line-subtle: var(--ds-color-border-subtle);
	--color-line-strong: var(--ds-color-border-strong);
	--color-hairline: var(--ds-color-border-hairline);
	--color-success: var(--ds-color-status-success);
	--color-warning: var(--ds-color-status-warning);
	--color-danger: var(--ds-color-status-danger);
	--color-ink: var(--ds-color-ink);
	--color-paper: var(--ds-color-paper);
	--color-sky: var(--ds-color-sky);
	--color-blue-edge: var(--ds-color-blue-edge);
	--color-blue-hover: var(--ds-color-blue-hover);
	--color-blue-5: var(--ds-color-blue-5);
	--color-blue-10: var(--ds-color-blue-10);
	--color-blue-mid: var(--ds-color-blue-mid);
	--color-blue-mist: var(--ds-color-blue-mist);
	--color-sky-wash: var(--ds-color-sky-wash);
	--color-search-selected: var(--ds-color-bg-search-selected);
	--color-neon: var(--ds-color-neon);
	--color-electric: var(--ds-color-electric);
	--color-heart: var(--ds-color-heart);
	--color-tint-sage: var(--ds-color-tint-sage);
	--color-tint-rose: var(--ds-color-tint-rose);
	--color-tint-teal: var(--ds-color-tint-teal);
	--color-tint-peach: var(--ds-color-tint-peach);
	--color-tint-butter: var(--ds-color-tint-butter);
	--color-page: var(--ds-color-bg-page);
	--color-glass: var(--ds-color-bg-glass);
	--color-note: var(--ds-color-bg-note);
	--color-code-soft: var(--ds-color-bg-code-soft);
	--color-raised-on-brand: var(--ds-color-bg-raised-on-brand);
	--color-fg-on-brand-muted: var(--ds-color-text-on-brand-muted);
	--color-fg-label: var(--ds-color-text-label);
	--color-fg-on-brand-label: var(--ds-color-text-on-brand-label);
	--color-fg-code: var(--ds-color-text-code);
	--color-fg-code-key: var(--ds-color-text-code-key);
	--color-fg-code-string: var(--ds-color-text-code-string);
	--color-fg-code-dim: var(--ds-color-text-code-dim);
	--color-fg-string: var(--ds-color-text-string);
	--color-line-mid: var(--ds-color-border-mid);
	--color-line-rule: var(--ds-color-border-rule);
	--color-line-field: var(--ds-color-border-field);
	--color-line-field-hover: var(--ds-color-border-field-hover);
	--color-line-key: var(--ds-color-border-key);
	--color-line-brand: var(--ds-color-border-brand);
	--color-line-brand-edge: var(--ds-color-border-brand-edge);
	--color-line-on-brand: var(--ds-color-border-on-brand);
	--color-line-on-brand-strong: var(--ds-color-border-on-brand-strong);
	--color-line-window: var(--ds-color-border-window);
	--color-line-glass: var(--ds-color-border-glass);
	--color-line-on-code: var(--ds-color-border-on-code);
	--color-line-on-code-hover: var(--ds-color-border-on-code-hover);
	--color-wash-hover: var(--ds-color-wash-hover);
	--color-wash-pill: var(--ds-color-wash-pill);
	--color-wash-selected: var(--ds-color-wash-selected);
	--color-wash-on-brand: var(--ds-color-wash-on-brand);
	--color-wash-glass-hover: var(--ds-color-wash-glass-hover);
	--color-ring-tint: var(--ds-color-ring-tint);
	--color-series-1: var(--ds-color-chart-series-1);
	--color-series-2: var(--ds-color-chart-series-2);
	--color-series-3: var(--ds-color-chart-series-3);
	--color-series-4: var(--ds-color-chart-series-4);
	--color-window-bar: var(--ds-color-window-bar);
	--color-window-bar-fg: var(--ds-color-window-bar-fg);
	--font-sans: var(--ds-font-sans);
	--font-display: var(--ds-font-display);
	--font-mono: var(--ds-font-mono);
	--font-code: var(--ds-font-code);
	--text-display: var(--ds-text-display);
	--text-hero: var(--ds-text-hero);
	--text-h1: var(--ds-text-h1);
	--text-h2: var(--ds-text-h2);
	--text-h3: var(--ds-text-h3);
	--text-h4: var(--ds-text-h4);
	--text-h5: var(--ds-text-h5);
	--text-body-lg: var(--ds-text-body-lg);
	--text-body: var(--ds-text-body);
	--text-button: var(--ds-text-button);
	--text-body-sm: var(--ds-text-body-sm);
	--text-snippet: var(--ds-text-snippet);
	--text-caption: var(--ds-text-caption);
	--text-bar: var(--ds-text-bar);
	--text-micro: var(--ds-text-micro);
	--leading-tight: var(--ds-leading-tight);
	--leading-heading: var(--ds-leading-heading);
	--leading-display: var(--ds-leading-display);
	--leading-snug: var(--ds-leading-snug);
	--leading-lead: var(--ds-leading-lead);
	--leading-body: var(--ds-leading-body);
	--leading-relaxed: var(--ds-leading-relaxed);
	--leading-code: var(--ds-leading-code);
	--tracking-display: var(--ds-tracking-display);
	--tracking-hero: var(--ds-tracking-hero);
	--tracking-tighter: var(--ds-tracking-tighter);
	--tracking-tight: var(--ds-tracking-tight);
	--tracking-snug: var(--ds-tracking-snug);
	--tracking-normal: var(--ds-tracking-normal);
	--tracking-label: var(--ds-tracking-label);
	--tracking-caps: var(--ds-tracking-caps);
	--tracking-mark: var(--ds-tracking-mark);
	--radius-chip: var(--ds-radius-chip);
	--radius-sm: var(--ds-radius-sm);
	--radius-menu: var(--ds-radius-menu);
	--radius-control: var(--ds-radius-control);
	--radius-card: var(--ds-radius-card);
	--radius-panel: var(--ds-radius-panel);
	--radius-shell: var(--ds-radius-shell);
	--radius-pill: var(--ds-radius-pill);
	--shadow-key: var(--ds-shadow-key);
	--shadow-key-brand: var(--ds-shadow-key-brand);
	--shadow-key-muted: var(--ds-shadow-key-muted);
	--shadow-pressed: var(--ds-shadow-pressed);
	--shadow-well: var(--ds-shadow-well);
	--shadow-guide: var(--ds-shadow-guide);
	--shadow-inset: var(--ds-shadow-inset);
	--shadow-card: var(--ds-shadow-card);
	--shadow-raised: var(--ds-shadow-raised);
	--shadow-code: var(--ds-shadow-code);
	--shadow-plan: var(--ds-shadow-plan);
	--shadow-tile: var(--ds-shadow-tile);
	--shadow-glass: var(--ds-shadow-glass);
	--shadow-floating: var(--ds-shadow-floating);
	--shadow-lit: var(--ds-shadow-lit);
	--shadow-glass-hover: var(--ds-shadow-glass-hover);
	--shadow-tooltip: var(--ds-shadow-tooltip);
	--shadow-ring-hover: var(--ds-shadow-ring-hover);
	--ease-out: var(--ds-easing-out);
	--ease-in-out: var(--ds-easing-in-out);
	--color-bg-brand: var(--ds-color-bg-brand);
	--font-weight-normal: var(--ds-font-weight-regular);
	--font-weight-medium: var(--ds-font-weight-medium);
	--font-weight-heading: var(--ds-font-weight-heading);
	--spacing-0: var(--ds-space-0);
	--spacing-px: var(--ds-space-px);
	--spacing-0\.5: var(--ds-space-0-5);
	--spacing-1: var(--ds-space-1);
	--spacing-1\.5: var(--ds-space-1-5);
	--spacing-2: var(--ds-space-2);
	--spacing-2\.5: var(--ds-space-2-5);
	--spacing-3: var(--ds-space-3);
	--spacing-3\.5: var(--ds-space-3-5);
	--spacing-4: var(--ds-space-4);
	--spacing-4\.5: var(--ds-space-4-5);
	--spacing-5: var(--ds-space-5);
	--spacing-6: var(--ds-space-6);
	--spacing-7: var(--ds-space-7);
	--spacing-8: var(--ds-space-8);
	--spacing-9: var(--ds-space-9);
	--spacing-10: var(--ds-space-10);
	--spacing-12: var(--ds-space-12);
	--spacing-14: var(--ds-space-14);
	--spacing-16: var(--ds-space-16);
	--spacing-20: var(--ds-space-20);
	--spacing-24: var(--ds-space-24);
	--spacing-28: var(--ds-space-28);
	--spacing-30: var(--ds-space-30);
	--spacing-32: var(--ds-space-32);
	--spacing-layout-column: var(--ds-layout-column);
	--spacing-layout-medium: var(--ds-layout-medium);
	--spacing-layout-gutter: var(--ds-layout-gutter);
	--spacing-layout-text: var(--ds-layout-text);
	--spacing-layout-heading: var(--ds-layout-heading);
	--spacing-layout-header: var(--ds-layout-header);
	--container-frame-column: var(--ds-frame-column);
	--background-image-glass-sheen: var(--ds-glass-sheen);
	--blur-glass: var(--ds-glass-blur);
	--transition-duration-fast: var(--ds-duration-fast);
	--transition-duration-base: var(--ds-duration-base);
	--transition-duration-moderate: var(--ds-duration-moderate);
	--transition-duration-slow: var(--ds-duration-slow);
	--ease-pop: var(--ds-easing-pop);
}

@theme {
	--animate-pop-in: ds-pop-in var(--ds-duration-fast) var(--ds-easing-out);
	--animate-fade-in: ds-fade-in var(--ds-duration-fast) var(--ds-easing-out);
	--animate-content-in: ds-content-in var(--ds-duration-base) var(--ds-easing-out);
	--animate-caret-blink: ds-caret-blink 1.1s steps(1) infinite;
	--animate-pulse-soft: ds-pulse-soft 1.6s var(--ds-easing-in-out) infinite;
	--animate-shimmer: ds-shimmer 1.6s var(--ds-easing-in-out) infinite;
	--animate-spin-slow: spin 0.8s linear infinite;
	--animate-accordion-down: ds-accordion-down var(--ds-duration-base) var(--ds-easing-out);
	--animate-accordion-up: ds-accordion-up var(--ds-duration-fast) var(--ds-easing-out);
	--animate-chart-line: ds-chart-line 900ms var(--ds-easing-out) backwards;
	--animate-chart-area: ds-fade-in 600ms var(--ds-easing-out) 250ms backwards;
	--animate-chart-tip: ds-chart-tip 360ms var(--ds-easing-out) backwards;
	--animate-chart-bar: ds-chart-bar 420ms var(--ds-easing-out) backwards;

	@keyframes ds-pop-in {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
	}

	@keyframes ds-fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-content-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	@keyframes ds-sheet-right {
		from {
			opacity: 0;
			transform: translateX(12px);
		}
	}

	@keyframes ds-sheet-left {
		from {
			opacity: 0;
			transform: translateX(-12px);
		}
	}

	@keyframes ds-accordion-down {
		from {
			height: 0;
		}
		to {
			height: var(--radix-accordion-content-height);
		}
	}

	@keyframes ds-accordion-up {
		from {
			height: var(--radix-accordion-content-height);
		}
		to {
			height: 0;
		}
	}

	@keyframes ds-chart-line {
		from {
			stroke-dashoffset: 1;
		}
	}

	@keyframes ds-chart-tip {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
	}

	@keyframes ds-chart-bar {
		from {
			transform: scaleY(0.04);
		}
	}

	@keyframes ds-caret-blink {
		50% {
			opacity: 0;
		}
	}

	@keyframes ds-pulse-soft {
		50% {
			opacity: 0.55;
		}
	}

	@keyframes ds-shimmer {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(100%);
		}
	}
}

@media (prefers-reduced-motion: reduce) {
	@keyframes ds-pop-in {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-content-in {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-sheet-right {
		from {
			opacity: 0;
		}
	}

	@keyframes ds-sheet-left {
		from {
			opacity: 0;
		}
	}
}

```
