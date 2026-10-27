import {type AnyExtension, Extension} from '@tiptap/core'
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle
} from '@tiptap/extension-text-style'

// Marks come from the shared doc, so a value may only hold what a color, size or font name needs.
// Without ';' it cannot add declarations such as a fixed overlay or a url() that loads a tracker
const SAFE_STYLE_VALUE = /^[a-z0-9#(),.%\s-]+$/i

const withSafeStyle = <T extends AnyExtension>(extension: T, name: string, property: string) =>
  extension.extend({
    addGlobalAttributes() {
      return (this.parent?.() ?? []).map((globalAttributes) => ({
        ...globalAttributes,
        attributes: {
          ...globalAttributes.attributes,
          [name]: {
            ...globalAttributes.attributes[name],
            renderHTML: (attributes: Record<string, unknown>) => {
              const value = attributes[name]
              return typeof value === 'string' && SAFE_STYLE_VALUE.test(value)
                ? {style: `${property}: ${value}`}
                : {}
            }
          }
        }
      }))
    }
  })

export const SafeTextStyleKit = Extension.create({
  name: 'textStyleKit',
  addExtensions() {
    return [
      withSafeStyle(BackgroundColor, 'backgroundColor', 'background-color'),
      withSafeStyle(Color, 'color', 'color'),
      withSafeStyle(FontFamily, 'fontFamily', 'font-family'),
      withSafeStyle(FontSize, 'fontSize', 'font-size'),
      withSafeStyle(LineHeight, 'lineHeight', 'line-height'),
      TextStyle
    ]
  }
})
