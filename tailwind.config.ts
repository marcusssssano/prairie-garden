import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Prairie Garden design tokens
        bg: "#FFFFFF",
        "bg-soft": "#F7F8F4",
        sage: "#A4B089",
        "sage-deep": "#6B7A54",
        forest: "#3D4A31",
        clay: "#C98B5B",
        "melina-purple": "#9B7FB5",
        "melina-teal": "#5FA8A0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        organic: "63% 37% 54% 46% / 55% 48% 52% 45%",
      },
    },
  },
  plugins: [],
};
export default config;
