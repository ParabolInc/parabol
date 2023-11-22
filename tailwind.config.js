const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: 'body',
  corePlugins: {
    preflight: false
  },
  presets: [require('./packages/client/tailwind.preset.js')],
  content: ['./packages/client/**/*.{ts,tsx,js,jsx,html}', './template.html'],
  safelist: [
    'bg-aqua-400',
    'bg-aqua-100',
    'bg-tomato-500',
    'bg-tomato-100',
    'bg-grape-500',
    'bg-jade-400',
    'bg-jade-100',
    'bg-rose-500',
    'bg-rose-100',
    'bg-gold-500',
    'bg-gold-100',
    'bg-grass-500',
    'bg-grass-100',
    'text-aqua-400',
    'text-aqua-100',
    'text-tomato-500',
    'text-tomato-100',
    'text-grape-500',
    'text-jade-400',
    'text-jade-100',
    'text-rose-500',
    'text-rose-100',
    'text-gold-500',
    'text-gold-100',
    'text-grass-500',
    'text-grass-100'
  ],
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
        'card-1':
          '0px 6px 10px rgba(68, 66, 88, 0.14), 0px 1px 18px rgba(68, 66, 88, 0.12), 0px 3px 5px rgba(68, 66, 88, 0.2)',
        dialog:
          '0px 11px 15px -7px rgba(0,0,0,.2), 0px 24px 38px 3px rgba(0,0,0,.14), 0px 9px 46px 8px rgba(0,0,0,.12)'
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
