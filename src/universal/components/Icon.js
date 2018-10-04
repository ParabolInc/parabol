import styled from 'react-emotion'
import {MD_ICONS_SIZE_24} from 'universal/styles/icons'

const Icon = styled('i')({
  fontFamily: 'Material Icons',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontSize: MD_ICONS_SIZE_24, // Preferred icon size
  display: 'inline-block',
  lineHeight: 1,
  textTransform: 'none',
  letterSpacing: 'normal',
  wordWrap: 'normal',
  whiteSpace: 'nowrap',
  direction: 'ltr',
  // Support for all WebKit browsers
  '-webkit-font-smoothing': 'antialiased',
  // Support for Safari and Chrome
  'text-rendering': 'optimizeLegibility',
  // Support for Firefox
  '-moz-osx-font-smoothing': 'grayscale',
  // Support for IE
  'font-feature-settings': 'liga'
})

export default Icon
