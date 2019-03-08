import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DelayUnmount from 'universal/components/DelayUnmount'
import {TimelineEvent_timelineEvent} from '__generated__/TimelineEvent_timelineEvent.graphql'

interface Props {
  timelineEvent: TimelineEvent_timelineEvent
}

const lookup = {
  TimelineEventJoinedParabol: lazy(() =>
    import(/* webpackChunkName: 'TimelineEventJoinedParabol' */ 'universal/components/TimelineEventJoinedParabol')
  ),
  TimelineEventTeamCreated: lazy(() =>
    import(/* webpackChunkName: 'TimelineEventTeamCreated' */ 'universal/components/TimelineEventTeamCreated')
  ),
  TimelineEventCompletedRetroMeeting: lazy(() =>
    import(/* webpackChunkName: 'TimelineEventCompletedRetroMeeting' */ 'universal/components/TimelineEventCompletedRetroMeeting')
  ),
  TimelineEventCompletedActionMeeting: lazy(() =>
    import(/* webpackChunkName: 'TimelineEventCompletedActionMeeting' */ 'universal/components/TimelineEventCompletedActionMeeting')
  )
}
function TimelineEvent(props: Props) {
  const {timelineEvent} = props
  let AsyncComponent
  if (timelineEvent) {
    const {__typename} = timelineEvent
    AsyncComponent = lookup[__typename]
  }
  return (
    <DelayUnmount unmountAfter={500}>
      {AsyncComponent ? <AsyncComponent timelineEvent={timelineEvent} /> : null}
    </DelayUnmount>
  )
}

export default createFragmentContainer(
  TimelineEvent,
  graphql`
    fragment TimelineEvent_timelineEvent on TimelineEvent {
      ...TimelineEventJoinedParabol_timelineEvent
      ...TimelineEventTeamCreated_timelineEvent
      ...TimelineEventCompletedRetroMeeting_timelineEvent
      ...TimelineEventCompletedActionMeeting_timelineEvent
      __typename
    }
  `
)
