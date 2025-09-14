import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./utils/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
}
export default config
