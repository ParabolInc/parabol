const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: 'body',
  corePlugins: {
    preflight: false
  },
  presets: [require('./packages/client/tailwind.preset.js')],
  content: ['./packages/client/**/*.{ts,tsx,js,jsx,html}', './template.html'],
  theme: {
    fontFamily: {
      sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono]
    },
    extend: {
      spacing: {
        'icon-md-18': '18px',
        'icon-md-24': '24px',
        'icon-md-36': '36px',
        'icon-md-40': '40px',
        'icon-md-48': '48px'
      },
      boxShadow: {
        'card-1': '0px 6px 10px rgba(68, 66, 88, 0.14), 0px 1px 18px rgba(68, 66, 88, 0.12), 0px 3px 5px rgba(68, 66, 88, 0.2)'
      },
      borderRadius: {
        card: '4px'
      },
      screens: {
        // => @media (min-width: 512px) { ... }
        invoice: '512px',
        'sidebar-left': '1024px',
        'new-meeting-grid': '1112px',
        'new-meeting-selector': '500px',
        'poker-discussion-fullscreen-drawer': '660px',
        'single-reflection-column': '704px', // (ReflectionWith + 16) * 2,
        'dashboard-widest': '1816px', // (4*296) + (5*24) + (256*2) = 4 card cols, 4 col gutters, 2 sidebars
        'vote-phase': '800px',
        'big-display': '1900px',
        'fuzzy-tablet': '700px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class' // only generate classes, overiding global form styles would affect non-tailwind other components
    }),
    require('@tailwindcss/container-queries')
  ]
}
