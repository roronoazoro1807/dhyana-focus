/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      colors: {
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      boxShadow: {
        "neon-sm": "0 0 2px var(--primary), 0 0 4px var(--primary)",
        "neon-md": "0 0 5px var(--primary), 0 0 10px var(--primary)",
        "neon-lg": "0 0 10px var(--primary), 0 0 20px var(--primary)",
      },
      textShadow: {
        "neon-sm": "0 0 2px var(--primary), 0 0 4px var(--primary)",
        "neon-md": "0 0 5px var(--primary), 0 0 10px var(--primary)",
        "neon-lg": "0 0 10px var(--primary), 0 0 20px var(--primary)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
