
import ui from 'universal/styles/ui';

export default function makeFieldColorPalette(colorPalette, hasPseudoClassStyles = true, customStyles) {
  const defaultCustomStyles = {
    base: {},
    placeholder: {},
    selection: {},
    hover: {},
    focus: {},
    active: {},
    ...customStyles
  };
  const {
    base,
    placeholder,
    selection,
    hover,
    focus,
    active
  } = defaultCustomStyles;
  const palettes = ui.fieldColorPalettes;
  const hoverFocusActive = {
    borderColor: palettes[colorPalette].focusBorderColor,
    boxShadow: ui.fieldFocusBoxShadow,
    outline: 'none'
  };
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
  };
  const addPsuedoClassStyles = hasPseudoClassStyles && pseudoClassStyles;
  return {
    backgroundColor: palettes[colorPalette].backgroundColor,
    borderColor: palettes[colorPalette].borderColor,
    borderRadius: ui.fieldBaseStyles.borderRadius,
    color: palettes[colorPalette].color,
    ...base,
    ...palettes[colorPalette].placeholder,
    ...placeholder,

    '::selection': {
      backgroundColor: palettes[colorPalette].selection,
      ...selection
    },

    ...addPsuedoClassStyles
  };
}
