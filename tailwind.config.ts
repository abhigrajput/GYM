import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cyber-black": "#000000",
        "cyber-dark": "#111111",
        "cyber-card": "#1a1a1a",
        neon: "#00FF41",
        "neon-dim": "#00CC33",
        "cyber-gray": "#888888",
        "cyber-border": "rgba(0,255,65,0.2)",
      },
      fontFamily: {
        sans: ["Rajdhani", "sans-serif"],
        heading: ["Orbitron", "monospace"],
        mono: ["Share Tech Mono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,255,65,0.3)",
        "neon-strong": "0 0 40px rgba(0,255,65,0.5)",
        "neon-subtle": "0 0 10px rgba(0,255,65,0.2)",
      },
    },
  },
  plugins: [],
}

export default config
