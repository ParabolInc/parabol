import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'

const borderStyles = {
  borderBottom: `1px solid ${PALETTE.SLATE_400}`,
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
