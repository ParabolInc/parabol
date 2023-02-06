import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import useBreakpoint from '../../hooks/useBreakpoint'
import useRefreshInterval from '../../hooks/useRefreshInterval'
import {Breakpoint} from '../../types/constEnums'
import {humanReadableCountdown} from '../../utils/date/relativeDate'
import {TeamPromptBadge} from './TeamPromptBadge'

interface NextMeetingLinkProps {
  closestActiveMeetingId: string
}

export const NextMeetingLink = (props: NextMeetingLinkProps) => {
  const {closestActiveMeetingId} = props
  return <StyledLink to={`/meet/${closestActiveMeetingId}`}>Go to the current activity.</StyledLink>
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

const TeamPromptEndedBadgeRoot = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'start'
})

const StyledLink = styled(Link)({
  textDecoration: 'underline',
  fontWeight: 400
})

const EmojiContainer = styled('span')({
  paddingRight: 8
})

const TeamPromptEndedTextContainer = styled('span')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'inline-block',
  width: isDesktop ? undefined : 220,
  overflow: 'hidden',
  overflowWrap: 'break-word'
}))

// here we just want one of the props to be present, never both
type Props = {closestActiveMeetingId: string} | {nextMeetingDate: Date} | Record<string, never>

export const TeamPromptEndedBadge = (props: Props) => {
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

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
      <TeamPromptEndedBadgeRoot>
        <EmojiContainer>✅</EmojiContainer>{' '}
        <TeamPromptEndedTextContainer isDesktop={isDesktop}>
          This activity has ended. {renderAdditionalInfo()}
        </TeamPromptEndedTextContainer>
      </TeamPromptEndedBadgeRoot>
    </TeamPromptBadge>
  )
}
