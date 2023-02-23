type ThemeColors =
  | 'tomato'
  | 'terra'
  | 'gold'
  | 'grass'
  | 'forest'
  | 'jade'
  | 'aqua'
  | 'lilac'
  | 'sky'
  | 'lilac'
  | 'grape'
  | 'fuscia'
  | 'rose'
  | 'slate'

type ColorVariant = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

interface TailwindPreset {
  theme: {
    colors: {
      white: string
      black: string
      primary: string
    } & {[key in ThemeColors]: string | {[key in ColorVariant]: string}}
  }
}

declare const tailwindPreset: TailwindPreset
export default tailwindPreset
