
// theme.js

import brand from './brand';

import tinycolor from 'tinycolor2';
import * as _ from 'lodash';

let theme = {};

if (typeof __PRODUCTION__ !== "undefined" && __PRODUCTION__) {
  /*
   * Production optimization, built by npm run build:server
   * and /src/universal/utils/buildThemeJS.js:
   */
  theme = require('theme-build');
} else {
  /*
   Set up your theme variables
  */

  theme = {
    cool: brand.darkCyan,
    warm: brand.darkishPink,
    dark: brand.slateGray,
    mid: brand.greyBlue,
    light: brand.eggShell
  };

  // Cool  (A)
  // Warm  (B)
  // Dark  (C)
  // Mid   (D)
  // Light (E)

  theme.a = theme.cool;
  theme.b = theme.warm;
  theme.c = theme.dark;
  theme.d = theme.mid;
  theme.e = theme.light;

  /*
     Set up theme utility classes
  */

  // Map brand/theme color variables to theme letter
  // slugs a-# where # is the letter depending on
  // how many brand/theme colors you have.

  const prefix = 'tu'; // 'tu' for 'theme utility'

  const themeColors = {
    a: theme.a,
    b: theme.b,
    c: theme.c,
    d: theme.d,
    e: theme.e
  };

  const alphaValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  const properties = {
    bg: 'backgroundColor',
    bc: 'borderColor',
    color: 'color'
  };

  // Enable darkened and/or opaque utility classes
  // ----------------------------------------------

  // $darkened-base: false;
  // $opaque-base: false;

  const darkendBase = '#000';
  const opaqueBase = '#fff';

  Object.keys(themeColors).forEach((color) => {
    Object.keys(properties).forEach((property) => {
      const propertySlug = `${prefix}${_.capitalize(color)}${_.capitalize(property)}`;
      theme[propertySlug] = { [property]: themeColors[color] };

      for (const value of alphaValues) {
        const alphaColor = tinycolor(themeColors[color])
                            .setAlpha(value * 0.01)
                            .toRgbString();
        const valueSlug = `${prefix}${_.capitalize(property)}${_.capitalize(color)}${value}a`;
        theme[valueSlug] = { [property]: alphaColor };

        if (darkendBase) {
          const darkendColor = tinycolor.mix(themeColors[color], darkendBase, value)
                                 .toRgbString();
          const darkSlug = `${prefix}${_.capitalize(property)}${_.capitalize(color)}${value}d`;
          theme[darkSlug] = { [property]: darkendColor };
        }

        if (opaqueBase) {
          const opaqueColor = tinycolor.mix(themeColors[color], opaqueBase, value)
                                 .toRgbString();
          const opaqueSlug = `${prefix}${_.capitalize(property)}${_.capitalize(color)}${value}o`;
          theme[opaqueSlug] = { [property]: opaqueColor };
        }
      }
    });
  });
}

export default theme;

  // Alpha attribute, fallback color mixin
  // --------------------------------------
  // Credit: http://thesassway.com/intermediate/mixins-for-semi-transparent-colors

  // Todo: Move this to the proper place for mixins (TA)

  /*
  @mixin alpha-attribute($attribute, $color, $background) {
    $percent: alpha($color) * 100%;
    $opaque: opacify($color, 1);
    $solid-color: mix($opaque, $background, $percent);
    #{$attribute}: $solid-color;
    #{$attribute}: $color;
  }
  */
