import graphql from 'babel-plugin-relay/macro'
import React, {lazy, Suspense} from 'react'
import {useFragment} from 'react-relay'
import {ValueOf} from '../types/generics'
import {TimelineEvent_timelineEvent$key} from '../__generated__/TimelineEvent_timelineEvent.graphql'
import DelayUnmount from './DelayUnmount'
import TimelineEventMock from './TimelineEventMock'

interface Props {
  timelineEvent: TimelineEvent_timelineEvent$key
}

const lookup = {
  TimelineEventJoinedParabol: lazy(
    () =>
      import(/* webpackChunkName: 'TimelineEventJoinedParabol' */ './TimelineEventJoinedParabol')
  ),
  TimelineEventTeamCreated: lazy(
    () => import(/* webpackChunkName: 'TimelineEventTeamCreated' */ './TimelineEventTeamCreated')
  ),
  TimelineEventCompletedRetroMeeting: lazy(
    () =>
      import(
        /* webpackChunkName: 'TimelineEventCompletedRetroMeeting' */ './TimelineEventCompletedRetroMeeting'
      )
  ),
  TimelineEventPokerComplete: lazy(
    () =>
      import(/* webpackChunkName: 'TimelineEventPokerComplete' */ './TimelineEventPokerComplete')
  ),
  TimelineEventCompletedActionMeeting: lazy(
    () =>
      import(
        /* webpackChunkName: 'TimelineEventCompletedActionMeeting' */ './TimelineEventCompletedActionMeeting'
      )
  ),
  TimelineEventTeamPromptComplete: lazy(
    () =>
      import(
        /* webpackChunkName: 'TimelineEventTeamPromptComplete' */ './TimelineEventTeamPromptComplete'
      )
  )
} as const

function TimelineEvent(props: Props) {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEvent_timelineEvent on TimelineEvent {
        ...TimelineEventJoinedParabol_timelineEvent
        ...TimelineEventTeamCreated_timelineEvent
        ...TimelineEventCompletedRetroMeeting_timelineEvent
        ...TimelineEventCompletedActionMeeting_timelineEvent
        ...TimelineEventPokerComplete_timelineEvent
        ...TimelineEventTeamPromptComplete_timelineEvent
        __typename
      }
    `,
    timelineEventRef
  )
  let AsyncComponent: undefined | ValueOf<typeof lookup>
  if (timelineEvent) {
    const {__typename} = timelineEvent
    AsyncComponent = lookup[__typename as keyof typeof lookup]
  }
  return (
    <DelayUnmount unmountAfter={500}>
      <Suspense fallback={<TimelineEventMock />}>
        {AsyncComponent ? <AsyncComponent timelineEvent={timelineEvent!} /> : null}
      </Suspense>
    </DelayUnmount>
  )
}

export default TimelineEvent
