import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        campus: {
          cyan:   "#00d4ff",
          purple: "#8b5cf6",
          green:  "#10b981",
          amber:  "#f59e0b",
          red:    "#ef4444",
          bg1:    "#020408",
          bg2:    "#060d18",
          bg3:    "#0a1628",
        },
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%,100%": { opacity: "0.5" },
          "50%":     { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "particle-rise": {
          "0%":   { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%":  { opacity: "1" },
          "90%":  { opacity: "0.6" },
          "100%": { transform: "translateY(-100vh) translateX(var(--dx,0px))", opacity: "0" },
        },
      },
      animation: {
        float:         "float 5s ease-in-out infinite",
        glow:          "glow-pulse 2s ease-in-out infinite",
        "slide-up":    "slide-up 0.5s ease both",
        ticker:        "ticker 25s linear infinite",
        "particle-rise": "particle-rise var(--dur,8s) linear var(--delay,0s) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;