import graphql from 'babel-plugin-relay/macro'
import {lazy, Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {TimelineEvent_timelineEvent$key} from '../__generated__/TimelineEvent_timelineEvent.graphql'
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
  ),
  TimelineEventTeamHealthComplete: lazy(
    () =>
      import(
        /* webpackChunkName: 'TimelineEventTeamHealthComplete' */ './TimelineEventTeamHealthComplete'
      )
  )
} as const

function TimelineEvent(props: Props) {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEvent_timelineEvent on TimelineEvent {
        ...TimelineEventJoinedParabol_timelineEvent @alias
        ...TimelineEventTeamCreated_timelineEvent @alias
        ...TimelineEventCompletedRetroMeeting_timelineEvent @alias
        ...TimelineEventCompletedActionMeeting_timelineEvent @alias
        ...TimelineEventPokerComplete_timelineEvent @alias
        ...TimelineEventTeamPromptComplete_timelineEvent @alias
        ...TimelineEventTeamHealthComplete_timelineEvent @alias
        __typename
      }
    `,
    timelineEventRef
  )
  const renderEvent = () => {
    if (!timelineEvent) return null
    const {
      TimelineEventJoinedParabol_timelineEvent: joinedParabol,
      TimelineEventTeamCreated_timelineEvent: teamCreated,
      TimelineEventCompletedRetroMeeting_timelineEvent: retroComplete,
      TimelineEventCompletedActionMeeting_timelineEvent: actionComplete,
      TimelineEventPokerComplete_timelineEvent: pokerComplete,
      TimelineEventTeamPromptComplete_timelineEvent: teamPromptComplete,
      TimelineEventTeamHealthComplete_timelineEvent: teamHealthComplete
    } = timelineEvent
    if (joinedParabol) return <lookup.TimelineEventJoinedParabol timelineEvent={joinedParabol} />
    if (teamCreated) return <lookup.TimelineEventTeamCreated timelineEvent={teamCreated} />
    if (retroComplete)
      return <lookup.TimelineEventCompletedRetroMeeting timelineEvent={retroComplete} />
    if (actionComplete)
      return <lookup.TimelineEventCompletedActionMeeting timelineEvent={actionComplete} />
    if (pokerComplete) return <lookup.TimelineEventPokerComplete timelineEvent={pokerComplete} />
    if (teamPromptComplete)
      return <lookup.TimelineEventTeamPromptComplete timelineEvent={teamPromptComplete} />
    if (teamHealthComplete)
      return <lookup.TimelineEventTeamHealthComplete timelineEvent={teamHealthComplete} />
    return null
  }
  return (
    <DelayUnmount unmountAfter={500}>
      <Suspense fallback={<TimelineEventMock />}>{renderEvent()}</Suspense>
    </DelayUnmount>
  )
}

export default TimelineEvent
