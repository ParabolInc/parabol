import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import {humanReadableCountdown} from '../../utils/date/relativeDate'
import {TeamPromptBadge} from './TeamPromptBadge'

const StyledLink = styled(Link)({
  textDecoration: 'underline'
})

// here we just want one of the props to be present, never both
type Props = {closestActiveMeetingId: string} | {nextMeetingDate: Date} | Record<string, never>

export const TeamPromptEndedBadge = (props: Props) => {
  const renderAdditionalInfo = () => {
    if ('closestActiveMeetingId' in props) {
      return (
        <StyledLink to={`/meet/${props.closestActiveMeetingId}`}>
          Go to the next activity.
        </StyledLink>
      )
    }

    if ('nextMeetingDate' in props) {
      return <span>Next one starts in {humanReadableCountdown(props.nextMeetingDate)}.</span>
    }

    return null
  }

  return (
    <TeamPromptBadge>
      <div>✅ This activity has ended. {renderAdditionalInfo()}</div>
    </TeamPromptBadge>
  )
}
