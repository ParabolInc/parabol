import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TimelineEventPokerComplete_timelineEvent$key} from '../__generated__/TimelineEventPokerComplete_timelineEvent.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import plural from '../utils/plural'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import CardsSVG from './CardsSVG'
import StyledLink from './StyledLink'
import TimelineEventTitle from './TImelineEventTitle'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'

interface Props {
  timelineEvent: TimelineEventPokerComplete_timelineEvent$key
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventPokerComplete = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
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
          summaryPageId
        }
        team {
          id
          name
          orgId
        }
      }
    `,
    timelineEventRef
  )
  const {meeting, team} = timelineEvent
  const {
    id: meetingId,
    name: meetingName,
    commentCount,
    storyCount,
    locked,
    organization,
    summaryPageId
  } = meeting
  const {name: teamName} = team
  const {id: orgId, viewerOrganizationUser} = organization
  const canUpgrade = !!viewerOrganizationUser

  const atmosphere = useAtmosphere()
  const onUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'timelineHistoryLock',
      upgradeTier: 'team',
      meetingId
    })
  }
  const summaryURL = summaryPageId
    ? `/pages/${Number(summaryPageId.split('page:')[1])}`
    : `/new-summary/${meetingId}`
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
            <Link to={summaryURL}>review a summary</Link>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventPokerComplete
