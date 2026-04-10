import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0A0A0A",
        accent: "#FF0033",
      },
      boxShadow: {
        accent: "0 0 40px rgba(255, 0, 51, 0.4)",
      },
      backgroundImage: {
        "noise-grid":
          "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08) 0, transparent 25%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.06) 0, transparent 30%)",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "0.25" },
          "20%": { opacity: "0.4" },
          "40%": { opacity: "0.08" },
          "70%": { opacity: "0.32" },
        },
      },
      animation: {
        flicker: "flicker 1.8s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
