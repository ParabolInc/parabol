import {PALETTE} from '../paletteV2'
import {Radius} from '../../types/constEnums'
import makePlaceholderStyles from './makePlaceholderStyles'

const fieldPalettes = {
  // emphasize fields e.g. agenda input
  cool: {
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
    color: PALETTE.TEXT_MAIN,
    focusBorderColor: PALETTE.BORDER_BLUE,
    placeholder: makePlaceholderStyles(PALETTE.TEXT_BLUE),
    placeholderColorFocusActive: makePlaceholderStyles(PALETTE.BORDER_BLUE),
    selection: PALETTE.BACKGROUND_PRIMARY_20A
  },
  // all fields
  white: {
    backgroundColor: '#FFFFFF',
    borderColor: PALETTE.BORDER_MAIN_40,
    color: PALETTE.TEXT_MAIN,
    focusBorderColor: PALETTE.BORDER_FIELD_FOCUS,
    placeholder: makePlaceholderStyles(PALETTE.PLACEHOLDER),
    placeholderColorFocusActive: makePlaceholderStyles(PALETTE.PLACEHOLDER_FOCUS_ACTIVE),
    selection: PALETTE.BACKGROUND_PRIMARY_20A
  }
}

export default function makeFieldColorPalette(
  colorPalette,
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
