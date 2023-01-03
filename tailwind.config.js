const defaultTheme = require('tailwindcss/defaultTheme')
/**
 * Palette definition from https://www.figma.com/file/OA9NkpSTlHVqqRL9IE9KsF/Palette-v3?node-id=15%3A2184&t=waDBAOGfSqB0wtCc-0
 */

const BRAND_PRIMARY = '#493272' // Grape 700

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./packages/client/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    fontFamily: {
      sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono]
    },
    colors: {
      primary: BRAND_PRIMARY,
      tomato: {
        100: '#FFE2E0',
        200: '#FFC1BD',
        300: '#FEA09A',
        400: '#FD7F77',
        500: '#FD6157',
        600: '#F23B31',
        700: '#D5211A',
        800: '#9F201E',
        900: '#6D1D1D'
      },
      terra: {
        100: '#FEDCCD',
        200: '#FFB89C',
        300: '#FE975D',
        400: '#D28963',
        500: '#D35D22',
        600: '#A34F25',
        700: '#823917',
        800: '#501F08',
        900: '#3A1404'
      },
      gold: {
        100: '#FAEBD3',
        200: '#FADC9E',
        300: '#FFCC63',
        400: '#FBB337',
        500: '#DE8E02',
        600: '#A36200',
        700: '#855000',
        800: '#703C00',
        900: '#522C00'
      },
      grass: {
        100: '#ECF1A7',
        200: '#DEE58A',
        300: '#C4CF66',
        400: '#BECF3F',
        500: '#ACC125',
        600: '#91A617',
        700: '#73880C',
        800: '#556704',
        900: '#354200'
      },
      forest: {
        100: '#E3F7D4',
        200: '#C8EBAD',
        300: '#9EC87E',
        400: '#73A153',
        500: '#639442',
        600: '#528433',
        700: '#427326',
        800: '#335F1B',
        900: '#244A11'
      },
      jade: {
        100: '#CFF2DE',
        200: '#ABEDC8',
        300: '#91E8B7',
        400: '#66BC8C',
        500: '#40B574',
        600: '#2D9F5F',
        700: '#1D8647',
        800: '#116931',
        900: '#08491E'
      },
      aqua: {
        100: '#CBECF0',
        200: '#A4DEE5',
        300: '#7CCFD9',
        400: '#55C0CF',
        500: '#33B1C7',
        600: '#2792AA',
        700: '#1C748D',
        800: '#12566D',
        900: '#0A3A4C'
      },
      sky: {
        100: '#E8F4FC',
        200: '#BBDDF7',
        300: '#8EC7F1',
        400: '#61B1EB',
        500: '#329AE5',
        600: '#14649E',
        700: '#0F4A76',
        800: '#0A314D',
        900: '#051A29'
      },
      lilac: {
        100: '#EEEDF7',
        200: '#D4D2EF',
        300: '#B7B4E9',
        400: '#9694E6',
        500: '#7272E5',
        600: '#5454E3',
        700: '#3333CC',
        800: '#2121AB',
        900: '#1A1A7F'
      },
      grape: {
        100: '#BD6BD6',
        200: '#B66BD6',
        300: '#AF6BD6',
        400: '#A86BD6',
        500: '#A06BD6',
        600: '#7340B5',
        700: BRAND_PRIMARY,
        800: '#2D1D53',
        900: '#170F34'
      },
      fuscia: {
        100: '#EDD5F1',
        200: '#E4B5E8',
        300: '#DE94E1',
        400: '#DB70DB',
        500: '#D345CF',
        600: '#BC29B2',
        700: '#941E88',
        800: '#6B1460',
        900: '#410B38'
      },
      rose: {
        100: '#F9E2ED',
        200: '#F4BED7',
        300: '#F099BF',
        400: '#EE72A4',
        500: '#ED4C86',
        600: '#EB195F',
        700: '#C20F45',
        800: '#95092F',
        900: '#66051C'
      },
      slate: {
        100: '#F8F7FC',
        200: '#F1F0FA',
        300: '#E0DDEC',
        400: '#C3C0D8',
        500: '#A7A3C2',
        600: '#82809A',
        700: '#444258',
        800: '#2D2D39',
        900: '#1C1C21'
      }
    },
    extend: {
      spacing: {
        'icon-md-18': '18px',
        'icon-md-24': '24px',
        'icon-md-36': '36px',
        'icon-md-40': '40px',
        'icon-md-48': '48px'
      }
    }
  },
  plugins: []
}
