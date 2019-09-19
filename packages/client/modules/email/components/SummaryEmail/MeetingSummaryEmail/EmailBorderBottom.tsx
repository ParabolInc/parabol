import React from 'react'
import {PALETTE} from '../../../../../styles/paletteV2'

const borderStyles = {
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHT}`,
  paddingBottom: 24
} as React.CSSProperties

const EmailBorderBottom = () => {
  return (
    <tr>
      <td style={borderStyles} />
    </tr>
  )
}

export default EmailBorderBottom
