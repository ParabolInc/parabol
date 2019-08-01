import React from 'react'
import {PALETTE_BORDER_LIGHT} from './constants'

const borderStyles = {
  borderBottom: `1px solid ${PALETTE_BORDER_LIGHT}`,
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
