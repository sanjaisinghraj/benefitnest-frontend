import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',   // Small phones
      'sm': '640px',   // Large phones
      'md': '768px',   // Tablets
      'lg': '1024px',  // Laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large desktops
      '3xl': '1920px', // Full HD monitors
      '4xl': '2560px', // 2K/4K monitors
    },
    extend: {
      // Fluid spacing using CSS clamp
      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.5vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 1.5vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 2vw, 2rem)',
        'fluid-5': 'clamp(1.5rem, 3vw, 3rem)',
        'fluid-6': 'clamp(2rem, 4vw, 4rem)',
      },
      // Fluid font sizes
      fontSize: {
        'fluid-xs': ['clamp(0.75rem, 1vw, 0.875rem)', { lineHeight: '1.5' }],
        'fluid-sm': ['clamp(0.875rem, 1.25vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 1.75vw, 1.25rem)', { lineHeight: '1.5' }],
        'fluid-xl': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.5rem, 2.5vw, 2rem)', { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.875rem, 3vw, 2.5rem)', { lineHeight: '1.2' }],
        'fluid-4xl': ['clamp(2.25rem, 4vw, 3rem)', { lineHeight: '1.1' }],
      },
      // Max widths for responsive containers
      maxWidth: {
        'screen-xs': '375px',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'screen-2xl': '1536px',
        'screen-3xl': '1920px',
        'screen-4xl': '2560px',
      },
      // Border radius responsive
      borderRadius: {
        'fluid': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-lg': 'clamp(0.75rem, 1.5vw, 1.5rem)',
        'fluid-xl': 'clamp(1rem, 2vw, 2rem)',
      },
      // Container padding
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};

export default config;
