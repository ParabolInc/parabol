import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import Ellipsis from '../../../../../components/Ellipsis/Ellipsis'

const explainerStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontStyle: 'italic',
  padding: '8px 48px',
  fontSize: 14
}

const WholeMeetingSummary = () => {
  return (
    <tr
      style={{
        borderBottom: `1px solid ${PALETTE.SLATE_400}`
      }}
    >
      <td
        align='center'
        style={{
          padding: '20px 0px',
          borderBottom: `1px solid ${PALETTE.SLATE_400}`
        }}
      >
        <tr>
          <td style={explainerStyle}>
            {'Hold tight! Our AI 🤖 is generating your meeting summary'}
            <Ellipsis />
          </td>
        </tr>
      </td>
    </tr>
  )
}

export default WholeMeetingSummary
