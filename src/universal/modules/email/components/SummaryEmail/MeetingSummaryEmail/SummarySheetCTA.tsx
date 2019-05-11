import {MeetingSummaryReferrer} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import {Link} from 'react-router-dom'
import React from 'react'
import {
  FONT_FAMILY,
  PALETTE_BACKGROUND_GRADIENT,
  PALETTE_BACKGROUND_RED
} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/constants'
import {buttonShadow} from 'universal/styles/elevation'

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
        {referrer === 'email' ? (
          <a href={teamDashUrl} title={teamDashLabel} style={primaryButtonStyle}>
            {teamDashLabel}
          </a>
        ) : (
          <Link style={primaryButtonStyle} to={teamDashUrl} title={teamDashLabel}>
            {teamDashLabel}
          </Link>
        )}
      </td>
    </tr>
  )
}

export default SummarySheetCTA
