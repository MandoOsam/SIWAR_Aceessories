import type { Config } from "tailwindcss";

/**
 * Every colour, font and radius is a CSS variable declared in `src/styles/tokens.css`.
 * Components must use these token names (`bg-surface`, `text-fg-muted`, ...) and never a
 * raw hex value, so a theme switch only has to change the variables.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        line: "var(--border)",
        fg: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          2: "var(--accent-2)",
        },
        wine: "var(--wine)",
        silver: "var(--silver)",
        // Navbar uses a translucent surface when it turns solid on scroll.
        glass: "var(--glass)",
        "on-accent": "var(--on-accent)",
        "on-hero": {
          DEFAULT: "var(--ink-on-hero)",
          muted: "var(--ink-on-hero-muted)",
        },
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
        editorial: "var(--font-editorial)",
      },
      fontSize: {
        // Fluid editorial scale from 05-ui-context.md section 4.2.
        "display-lg": "clamp(2.5rem, 1.2rem + 6vw, 6rem)",
        display: "clamp(2rem, 1.1rem + 4vw, 4rem)",
        heading: "clamp(1.5rem, 1.1rem + 2vw, 2.5rem)",
        "heading-sm": "clamp(1.25rem, 1rem + 1.2vw, 1.75rem)",
        lead: "clamp(1rem, 0.95rem + 0.4vw, 1.25rem)",
      },
      borderRadius: {
        // Sharp luxury feel: cards and buttons stay almost square.
        card: "var(--radius-card)",
        control: "var(--radius-control)",
        pill: "var(--radius-pill)",
      },
      maxWidth: {
        container: "var(--container-max)",
      },
      transitionTimingFunction: {
        // The single easing curve used by every animation in the design.
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      spacing: {
        // Spacing scale from 05-ui-context.md section 4.3.
        18: "4.5rem",
        30: "7.5rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-start": {
          // `--drawer-from` is set per direction in globals.css so one keyframe serves both
          // RTL (slides in from the right) and LTR (slides in from the left).
          from: { transform: "translateX(var(--drawer-from, -100%))" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "drawer-in": "slide-in-start 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
