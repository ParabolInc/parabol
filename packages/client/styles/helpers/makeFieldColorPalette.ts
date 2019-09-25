import {PALETTE} from '../paletteV2'
import {Radius} from '../../types/constEnums'
import makePlaceholderStyles from './makePlaceholderStyles'

const fieldPalettes = {
  // gray: input and textarea default style
  gray: {
    backgroundColor: PALETTE.BACKGROUND_MAIN,
    borderColor: PALETTE.BORDER_MAIN_40,
    color: PALETTE.TEXT_FIELD_DARK,
    focusBorderColor: PALETTE.BORDER_FIELD_FOCUS,
    placeholder: makePlaceholderStyles(PALETTE.PLACEHOLDER),
    placeholderColorFocusActive: makePlaceholderStyles(PALETTE.PLACEHOLDER_FOCUS_ACTIVE),
    selection: PALETTE.BACKGROUND_PRIMARY_20A
  },
  // primary: used by agenda topic input
  primary: {
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
    color: PALETTE.TEXT_MAIN,
    focusBorderColor: PALETTE.BORDER_WARM_FIELD_FOCUS,
    placeholder: makePlaceholderStyles(PALETTE.TEXT_ORANGE),
    placeholderColorFocusActive: makePlaceholderStyles(PALETTE.PLACEHOLDER_WARM_FOCUS_ACTIVE),
    selection: PALETTE.FIELD_SELECTION_WARM
  },
  // white: used for dropdowns
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

export default function makeFieldColorPalette (
  colorPalette,
  hasPseudoClassStyles = true,
  customStyles
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

    ...addPsuedoClassStyles
  }
}
