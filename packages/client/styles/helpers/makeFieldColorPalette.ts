import {Radius} from '../../types/constEnums'
import makePlaceholderStyles from './makePlaceholderStyles'

const fieldPalettes = {
  // emphasize fields e.g. agenda input
  cool: {
    backgroundColor: 'var(--color-surface-input)',
    borderColor: 'transparent',
    color: 'var(--color-fg-primary)',
    focusBorderColor: 'var(--color-accent)',
    placeholder: makePlaceholderStyles('var(--color-accent)'),
    placeholderColorFocusActive: makePlaceholderStyles('var(--color-accent)'),
    selection: 'var(--color-hairline-strong)'
  },
  // all fields
  white: {
    backgroundColor: 'var(--color-surface-input)',
    borderColor: 'var(--color-hairline-field)',
    color: 'var(--color-fg-primary)',
    focusBorderColor: 'var(--color-fg-primary)',
    placeholder: makePlaceholderStyles('var(--color-fg-muted)'),
    placeholderColorFocusActive: makePlaceholderStyles('var(--color-hairline-strong)'),
    selection: 'var(--color-hairline-strong)'
  }
}

export default function makeFieldColorPalette(
  colorPalette: keyof typeof fieldPalettes,
  hasPseudoClassStyles = true,
  customStyles = {}
) {
  const defaultCustomStyles = {
    base: {},
    placeholder: {},
    selection: {},
    hover: {},
    focus: {},
    active: {},
    ...customStyles
  }
  const {base, placeholder, selection, hover, focus, active} = defaultCustomStyles
  const hoverFocusActive = {
    borderColor: fieldPalettes[colorPalette].focusBorderColor,
    outline: 'none'
  }
  const pseudoClassStyles = {
    ':hover': {
      ...hoverFocusActive,
      ...hover
    },
    ':focus': {
      ...hoverFocusActive,
      ...focus
    },
    ':active': {
      ...hoverFocusActive,
      ...active
    }
  }
  const addPsuedoClassStyles = hasPseudoClassStyles && pseudoClassStyles
  return {
    backgroundColor: fieldPalettes[colorPalette].backgroundColor,
    borderColor: fieldPalettes[colorPalette].borderColor,
    borderRadius: Radius.FIELD,
    color: fieldPalettes[colorPalette].color,
    ...base,
    ...fieldPalettes[colorPalette].placeholder,
    ...placeholder,

    '::selection': {
      backgroundColor: fieldPalettes[colorPalette].selection,
      ...selection
    },
    ...addPsuedoClassStyles,
    ...customStyles
  }
}
