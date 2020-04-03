import {TimelineEventTeamCreated_timelineEvent} from '../__generated__/TimelineEventTeamCreated_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'
import styled from '@emotion/styled'

interface Props {
  timelineEvent: TimelineEventTeamCreated_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

class TimelineEventTeamCreated extends Component<Props> {
  render() {
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
              <Link to={`/team/${teamId}`}>team dashboard</Link>
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
