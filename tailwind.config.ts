import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)"],
        inter: ["var(--font-inter)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        oracle: {
          amber: {
            DEFAULT: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          navy: {
            DEFAULT: "#0F172A",
            light: "#1E293B",
            lighter: "#334155",
          },
          yes: "#10B981",
          no: "#EF4444",
        },
      },
      backgroundImage: {
        "oracle-gradient": "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        "sentiment-bullish": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        "sentiment-bearish": "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      },
      boxShadow: {
        "oracle-glow": "0 0 20px rgba(245, 158, 11, 0.5)",
        "oracle-glow-lg": "0 0 40px rgba(245, 158, 11, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 158, 11, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;