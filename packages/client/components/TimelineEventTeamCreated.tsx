import {TimelineEventTeamCreated_timelineEvent} from '../__generated__/TimelineEventTeamCreated_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventTeamCreated_timelineEvent
}

class TimelineEventTeamCreated extends Component<Props> {
  render () {
    const {timelineEvent} = this.props
    const {team} = timelineEvent
    const {id: teamId, name: teamName, isArchived} = team
    return (
      <TimelineEventCard
        iconName='group_add'
        timelineEvent={timelineEvent}
        title={<TimelineEventTitle>{`You created ${teamName}`}</TimelineEventTitle>}
      >
        <TimelineEventBody>
          {isArchived ? (
            'But now it is archived. What a wild ride!'
          ) : (
            <>
              {'Visit your '}
              <StyledLink to={`/team/${teamId}`}>Team Dashboard</StyledLink>
              {'.'}
            </>
          )}
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(TimelineEventTeamCreated, {
  timelineEvent: graphql`
    fragment TimelineEventTeamCreated_timelineEvent on TimelineEventTeamCreated {
      ...TimelineEventCard_timelineEvent
      id
      team {
        id
        isArchived
        name
      }
    }
  `
})
