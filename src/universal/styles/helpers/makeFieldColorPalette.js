
import ui from 'universal/styles/ui';

const {fieldColorPalettes} = ui;

export default function makeFieldColorPalette(colorPalette, disabled = false, palettes = fieldColorPalettes) {
  const states = {
    ':focus': {
      borderColor: palettes[colorPalette].focusBorderColor,
      boxShadow: ui.fieldFocusBoxShadow,
      outline: 'none'
    },
    ':active': {
      borderColor: palettes[colorPalette].focusBorderColor,
      boxShadow: ui.fieldFocusBoxShadow,
      outline: 'none'
    }
  };
  const addStates = !disabled && states;
  return {
    backgroundColor: palettes[colorPalette].backgroundColor,
    borderColor: palettes[colorPalette].borderColor,
    borderRadius: ui.fieldBaseStyles.borderRadius,
    color: palettes[colorPalette].color,
    ...palettes[colorPalette].placeholder,

    '::selection': {
      backgroundColor: palettes[colorPalette].selection
    },

    ...addStates
  };
}
