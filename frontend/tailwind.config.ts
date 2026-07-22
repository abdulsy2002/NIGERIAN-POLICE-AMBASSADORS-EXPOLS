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
        primary: "#003366",
        "primary-dark": "#002147",
        secondary: "#f4b400",
        "bg-light": "#f5f7fb",
        "text-dark": "#1f2937",
      },
    },
  },
  plugins: [],
};
export default config;