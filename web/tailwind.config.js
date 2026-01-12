/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Arial"],
        body: ["ui-sans-serif", "system-ui", "Inter", "Arial"]
      }
    }
  },
  plugins: []
};
