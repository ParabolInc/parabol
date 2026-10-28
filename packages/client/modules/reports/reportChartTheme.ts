import type {ResolvedTheme} from '../../utils/themePreference'

// the canvas can't read the theme's tokens, so these mirror hairline, fg-muted and the tooltip colors
const CHART_THEMES = {
  light: {
    grid: '#E0DDEC',
    tick: '#6C6A83',
    tooltip: '#1C1C21',
    tooltipText: '#F1F0FA',
    card: '#FFFFFF'
  },
  dark: {
    grid: 'rgba(183, 180, 233, 0.16)',
    tick: '#AEAAD8',
    tooltip: '#493272',
    tooltipText: '#EEEDF7',
    card: '#362B63'
  }
} as const

export const getReportChartTheme = (theme: ResolvedTheme) => CHART_THEMES[theme]

export const getReportChartFont = () => ({
  family: getComputedStyle(document.body).fontFamily,
  size: 12
})

// a step the period cuts short is drawn lighter, so it doesn't read as a drop
export const PARTIAL_STEP_ALPHA = '73'
