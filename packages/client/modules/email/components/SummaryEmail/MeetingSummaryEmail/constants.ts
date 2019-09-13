/* All the dirty hacks to make HTML4 fly under the radar */

declare module 'react' {
  interface TdHTMLAttributes<T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
    valign?: string
  }
  interface TableHTMLAttributes<T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}

export const FONT_FAMILY =
  '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif'
export const PALETTE_TEXT_GRAY = '#82809A'
export const PALETTE_TEXT_MAIN = '#444258'
export const PALETTE_TEXT_GREEN = '#61BF8B'
export const PALETTE_BACKGROUND_MAIN = '#F1F0FA'
export const PALETTE_BACKGROUND_RED = '#FD6157'
export const PALETTE_BACKGROUND_GRADIENT_RED = '#ED4C56'
export const PALETTE_BACKGROUND_GRADIENT_ROSE = '#ED4C86'
export const PALETTE_BACKGROUND_GRADIENT = `linear-gradient(to right, ${PALETTE_BACKGROUND_GRADIENT_RED} 0, ${PALETTE_BACKGROUND_GRADIENT_ROSE} 100%)`
export const PALETTE_BORDER_LIGHT = '#C1C0CD'
