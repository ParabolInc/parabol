import tinycolor from 'tinycolor2';
import brand from './brand';

const theme = {
  cool: brand.darkCyan,
  warm: brand.darkishPink,
  dark: brand.slateGray,
  mid: brand.greyBlue,
  light: brand.eggShell
};

// suffix 'a' results in transparent theme value
const alphaValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];
// suffix 'd' results in darkened theme value
const darkenedBase = '#000';
// suffix 'g' results in theme color mixed with 50% gray
const grayedBase = '#808080';
// suffix 'l' results in lightened theme value
const lightenedBase = '#fff';

Object.keys(theme).forEach((color) => {
  alphaValues.forEach((value) => {
    const alphaColor = tinycolor(theme[color]).setAlpha(value * 0.01).toRgbString();
    const alphaSlug = `${color}${value}a`;
    theme[alphaSlug] = alphaColor;

    if (darkenedBase) {
      const darkenedColor = tinycolor.mix(darkenedBase, theme[color], value).toHexString();
      const darkenedSlug = `${color}${value}d`;
      theme[darkenedSlug] = darkenedColor;
    }

    if (grayedBase) {
      const grayedColor = tinycolor.mix(grayedBase, theme[color], value).toHexString();
      const grayedSlug = `${color}${value}g`;
      theme[grayedSlug] = grayedColor;
    }

    if (lightenedBase) {
      const lightenedColor = tinycolor.mix(lightenedBase, theme[color], value).toHexString();
      const lightenedSlug = `${color}${value}l`;
      theme[lightenedSlug] = lightenedColor;
    }
  });
});

export default theme;
