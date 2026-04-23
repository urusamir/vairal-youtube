/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1E293B",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        primary: {
          DEFAULT: "#4671F6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        muted: {
          DEFAULT: "#F8FAFF",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#EFF6FF",
          foreground: "#1d4ed8",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#FFFFFF"
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#4671F6",
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
          primary: "#4671F6",
          "primary-foreground": "#FFFFFF",
          accent: "#EFF6FF",
          "accent-foreground": "#1d4ed8",
          border: "#E2E8F0",
          ring: "#4671F6",
        },
      },
      borderRadius: {
        lg: "1.5rem",
        md: "1rem",
        sm: "0.75rem",
      },
      borderColor: {
        DEFAULT: "#E2E8F0",
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(70, 113, 246, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        'float': '0 20px 40px -20px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom right, #ffffff, #eff6ff)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
