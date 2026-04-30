import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import tailwindCssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      Matter: ['Matter', 'sans-serif'],
      'Matter-Medium': ['Matter-Medium', 'sans-serif'],
      'Matter-Bold': ['Matter-Bold', 'sans-serif'],
    },
    container: {
      center: true,
      screens: {
        default: '767px',
      },
      padding: '1rem',
    },
    extend: {
      screens: {
        xxs: '432px',
        xs: '581px',
      },
      animation: {
        shake: 'shake 0.41s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '10%, 90%': {
            transform: 'translate3d(-1px, 0, 0)',
          },
          '20%, 80%': {
            transform: 'translate3d(2px, 0, 0)',
          },
          '30%, 50%, 70%': {
            transform: 'translate3d(-4px, 0, 0)',
          },
          '40%, 60%': {
            transform: 'translate3d(4px, 0, 0)',
          },
        },
      },
      colors: {
        background: 'hsla(var(--background))',
        foreground: 'hsla(var(--foreground))',
        black: 'hsla(var(--black))',
        white: 'hsla(var(--white))',
        green: 'hsla(var(--green))',
        orange: 'hsla(var(--orange))',
        'off-black': 'hsla(var(--off-black))',
        'light-grey': 'hsla(var(--light-grey))',
        blue: 'hsla(var(--blue))',
        'tab-inactive': 'hsla(var(--tab-inactive))',
        card: {
          DEFAULT: 'hsla(var(--card))',
          foreground: 'hsla(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsla(var(--popover))',
          foreground: 'hsla(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsla(var(--primary))',
          foreground: 'hsla(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsla(var(--secondary))',
          foreground: 'hsla(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsla(var(--muted))',
          foreground: 'hsla(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsla(var(--accent))',
          foreground: 'hsla(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsla(var(--destructive))',
          foreground: 'hsla(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsla(var(--success))',
          foreground: 'hsla(var(--success-foreground))',
        },
        border: 'hsla(var(--border))',
        input: 'hsla(var(--input))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [forms, tailwindCssAnimate],
};

export default config;
