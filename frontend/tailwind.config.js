import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        surface: {
          DEFAULT: "var(--color-surface-default)",
          alt: "var(--color-surface-alt)",
          inverse: "var(--color-surface-inverse)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          muted: "var(--color-border-muted)",
          strong: "var(--color-border-strong)",
        },
        success: {
          DEFAULT: "var(--color-success-500)",
          50: "var(--color-success-50)",
        },
        warning: {
          DEFAULT: "var(--color-warning-500)",
          50: "var(--color-warning-50)",
        },
        error: {
          DEFAULT: "var(--color-error-500)",
          50: "var(--color-error-50)",
        },
      },
      fontFamily: {
        sans: ["var(--font-family-base)", ...defaultTheme.fontFamily.sans],
        heading: ["var(--font-family-heading)", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        elevated: "var(--shadow-elevated)",
      },
      borderRadius: {
        component: "var(--radius-md)",
        card: "var(--radius-lg)",
        pill: "var(--radius-full)",
      },
      spacing: {
        "stack-section": "var(--space-stack-section)",
        "stack-block": "var(--space-stack-block)",
      },
      transitionTimingFunction: {
        system: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "350ms",
      },
    },
  },
  plugins: [],
};
