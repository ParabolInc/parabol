import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TimelineEventJoinedParabol_timelineEvent$key} from '../__generated__/TimelineEventJoinedParabol_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventJoinedParabol_timelineEvent$key
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventJoinedParabol = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventJoinedParabol_timelineEvent on TimelineEventJoinedParabol {
        ...TimelineEventCard_timelineEvent
        id
      }
    `,
    timelineEventRef
  )
  return (
    <TimelineEventCard
      iconName='account_circle'
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>You joined Parabol</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'Get started by updating your name and avatar in your '}
        <Link to='/me/profile'>user profile</Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventJoinedParabol
