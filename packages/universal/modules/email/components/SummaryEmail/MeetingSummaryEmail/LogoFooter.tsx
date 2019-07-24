import React from 'react'
import emailDir from '../../../emailDir'
import {
  FONT_FAMILY,
  PALETTE_TEXT_MAIN
} from './constants'

const logoStyle = {
  paddingTop: 64
}

const taglineStyle = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: 13,
  paddingTop: 8,
  paddingBottom: 32
}

const LogoFooter = () => {
  return (
    <>
      <tr>
        <td align='center' style={logoStyle}>
          <img src={`${emailDir}mark-color@3x.png`} height='28' width='31' />
        </td>
      </tr>
      <tr>
        <td align='center' style={taglineStyle}>
          {'Crafted with care by the folks at Parabol'}
        </td>
      </tr>
    </>
  )
}

export default LogoFooter
