import {themeBackgroundColors} from './themeBackgroundColors'

export const selectThemeBackgroundColor = (seed: string): string => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const idx = Math.abs(hash) % themeBackgroundColors.length
  return themeBackgroundColors[idx]!
}
