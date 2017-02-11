
import ui from 'universal/styles/ui';

const {fieldColorPalettes} = ui;

export default function makeFieldColorPalette(colorPalette, palettes = fieldColorPalettes) {
  return {
    backgroundColor: palettes[colorPalette].backgroundColor,
    borderColor: palettes[colorPalette].borderColor,
    color: palettes[colorPalette].color,
    ...palettes[colorPalette].placeholder,
    '::selection': {
      backgroundColor: palettes[colorPalette].selection
    },
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
}
