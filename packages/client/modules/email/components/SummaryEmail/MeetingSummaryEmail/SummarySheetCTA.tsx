import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import React from 'react'
import {
  FONT_FAMILY,
  PALETTE_BACKGROUND_GRADIENT,
  PALETTE_BACKGROUND_RED
} from './constants'
import {buttonShadow} from '../../../../../styles/elevation'
import AnchorIfEmail from './AnchorIfEmail'

interface Props {
  referrer: MeetingSummaryReferrer
  isDemo: boolean
  teamDashUrl: string
}

const teamDashLabel = 'Go to Team Dashboard'

const primaryButtonStyle = {
  backgroundColor: PALETTE_BACKGROUND_RED,
  backgroundImage: PALETTE_BACKGROUND_GRADIENT,
  borderRadius: 32,
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontWeight: 600,
  padding: '9px 20px',
  textDecoration: 'none'
}

const buttonCellStyle = {
  paddingTop: 44
}

const SummarySheetCTA = (props: Props) => {
  const {isDemo, referrer, teamDashUrl} = props
  if (isDemo) return null
  return (
    <tr>
      <td align={'center'} style={buttonCellStyle}>
        <AnchorIfEmail
          isEmail={referrer === 'email'}
          href={teamDashUrl}
          style={primaryButtonStyle}
          title={teamDashLabel}
        >
          {teamDashLabel}
        </AnchorIfEmail>
      </td>
    </tr>
  )
}

export default SummarySheetCTA
