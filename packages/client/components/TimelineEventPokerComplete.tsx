import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import plural from '../utils/plural'
import {TimelineEventPokerComplete_timelineEvent} from '../__generated__/TimelineEventPokerComplete_timelineEvent.graphql'
import CardsSVG from './CardsSVG'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventPokerComplete_timelineEvent
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventPokerComplete = (props: Props) => {
  const {timelineEvent} = props
  const {meeting, team} = timelineEvent
  const {id: meetingId, name: meetingName, commentCount, storyCount, locked, organization} = meeting
  const {name: teamName} = team
  const {id: orgId, viewerOrganizationUser} = organization
  const canUpgrade = !!viewerOrganizationUser

  const atmosphere = useAtmosphere()
  const onUpgrade = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade Intent', {
      source: 'Timeline History Locked Meeting Upgrade CTA',
      upgradeTier: 'pro',
      meetingId
    })
  }

  return (
    <TimelineEventCard
      IconSVG={locked && canUpgrade ? undefined : <CardsSVG />}
      iconName={locked && canUpgrade ? 'lock' : undefined}
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'You voted on '}
        <CountItem>
          {storyCount} {plural(storyCount, 'story', 'stories')}
        </CountItem>
        {' and added '}
        <CountItem>
          {commentCount} {plural(commentCount, 'comment')}
        </CountItem>
        {'.'}
        <br />
        {locked ? (
          canUpgrade && (
            <>
              <Link to={`/me/organizations/${orgId}`} onClick={onUpgrade}>
                Upgrade now
              </Link>{' '}
              to get access to the estimates and summary
            </>
          )
        ) : (
          <>
            <Link to={`/meet/${meetingId}/estimate/1`}>See the estimates</Link>
            {' in your meeting or '}
            <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventPokerComplete, {
  timelineEvent: graphql`
    fragment TimelineEventPokerComplete_timelineEvent on TimelineEventPokerComplete {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        commentCount
        storyCount
        name
        phases {
          phaseType
          ... on EstimatePhase {
            stages {
              id
            }
          }
        }
        locked
        organization {
          id
          viewerOrganizationUser {
            id
          }
        }
      }
      team {
        id
        name
        orgId
      }
    }
  `
})
