import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TimelineEventTeamHealthComplete_timelineEvent$key} from '../__generated__/TimelineEventTeamHealthComplete_timelineEvent.graphql'
import {GQLID} from '../utils/GQLID'
import StyledLink from './StyledLink'
import TimelineEventTitle from './TImelineEventTitle'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'

interface Props {
  timelineEvent: TimelineEventTeamHealthComplete_timelineEvent$key
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventTeamHealthComplete = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventTeamHealthComplete_timelineEvent on TimelineEventTeamHealthComplete {
        ...TimelineEventCard_timelineEvent
        id
        meeting {
          id
          name
          locked
          summaryPageId
        }
        team {
          id
          name
        }
      }
    `,
    timelineEventRef
  )

  const {meeting, team} = timelineEvent
  if (!meeting) {
    return null
  }

  const {id: meetingId, name: meetingName, locked, summaryPageId} = meeting
  const {name: teamName} = team
  const summaryURL = summaryPageId
    ? `/pages/${GQLID.fromKey(summaryPageId)[0]}`
    : `/new-summary/${meetingId}`

  return (
    <TimelineEventCard
      iconName={locked ? 'lock' : 'health_and_safety'}
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName}`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'Your team checked in on how it’s doing.'}
        <br />
        {!locked && <Link to={summaryURL}>Review a summary</Link>}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventTeamHealthComplete
