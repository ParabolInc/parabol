import css from '@emotion/css'
import {ICON_SIZE} from '../typographyV2'

export const iconStyles = css`
  flex-shrink: 0;
  font-weight: normal;
  font-style: normal;
  /*  Preferred icon size (24px) */
  font-size: ${ICON_SIZE.MD24};
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /*  Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;
  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;
  /* Support for IE. */
  font-feature-settings: liga;
`
