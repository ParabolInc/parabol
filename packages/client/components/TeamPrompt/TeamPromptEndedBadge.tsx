import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import useRefreshInterval from '../../hooks/useRefreshInterval'
import {humanReadableCountdown} from '../../utils/date/relativeDate'
import {TeamPromptBadge} from './TeamPromptBadge'

interface NextMeetingLinkProps {
  closestActiveMeetingId: string
}

export const NextMeetingLink = (props: NextMeetingLinkProps) => {
  const {closestActiveMeetingId} = props
  return <StyledLink to={`/meet/${closestActiveMeetingId}`}>Go to the next activity.</StyledLink>
}

interface NextMeetingCountdownProps {
  nextMeetingDate: Date
}

export const NextMeetingCountdown = (props: NextMeetingCountdownProps) => {
  const {nextMeetingDate} = props
  useRefreshInterval(1000)
  const fromNow = humanReadableCountdown(nextMeetingDate)
  if (!fromNow) return null

  return <span>Next one starts in {humanReadableCountdown(nextMeetingDate)}.</span>
}

const StyledLink = styled(Link)({
  textDecoration: 'underline',
  fontWeight: 400
})

const EmojiContainer = styled('span')({
  paddingRight: 4
})

// here we just want one of the props to be present, never both
type Props = {closestActiveMeetingId: string} | {nextMeetingDate: Date} | Record<string, never>

export const TeamPromptEndedBadge = (props: Props) => {
  const renderAdditionalInfo = () => {
    if ('closestActiveMeetingId' in props) {
      return <NextMeetingLink closestActiveMeetingId={props.closestActiveMeetingId} />
    }

    if ('nextMeetingDate' in props) {
      return <NextMeetingCountdown nextMeetingDate={props.nextMeetingDate} />
    }

    return null
  }

  return (
    <TeamPromptBadge>
      <div>
        <EmojiContainer>✅</EmojiContainer> This activity has ended. {renderAdditionalInfo()}
      </div>
    </TeamPromptBadge>
  )
}
