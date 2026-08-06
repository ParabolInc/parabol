import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TimelineEventTeamPromptComplete_timelineEvent$key} from '../__generated__/TimelineEventTeamPromptComplete_timelineEvent.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {GQLID} from '../utils/GQLID'
import plural from '../utils/plural'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import StyledLink from './StyledLink'
import TimelineEventTitle from './TImelineEventTitle'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'

interface Props {
  timelineEvent: TimelineEventTeamPromptComplete_timelineEvent$key
}

const TimelineEventTeamPromptComplete = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventTeamPromptComplete_timelineEvent on TimelineEventTeamPromptComplete {
        ...TimelineEventCard_timelineEvent
        id
        meeting {
          id
          name
          responseCount
          taskCount
          commentCount
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
        }
      }
    `,
    timelineEventRef
  )

  const atmosphere = useAtmosphere()

  const {meeting, team} = timelineEvent
  if (!meeting) {
    return null
  }

  const {
    id: meetingId,
    name: meetingName,
    responseCount,
    commentCount,
    taskCount,
    locked,
    organization,
    summaryPageId
  } = meeting
  const {name: teamName} = team
  const {id: orgId, viewerOrganizationUser} = organization
  const canUpgrade = !!viewerOrganizationUser
  const summaryURL = summaryPageId
    ? `/pages/${GQLID.fromKey(summaryPageId)[0]}`
    : `/new-summary/${meetingId}`
  const onUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'timelineHistoryLock',
      upgradeTier: 'team',
      meetingId
    })
  }

  return (
    <TimelineEventCard
      iconName={locked && canUpgrade ? 'lock' : 'group_work'}
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName}`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'Your team shared '}
        <span className='font-semibold'>
          {responseCount} {plural(responseCount, 'response', 'responses')}
        </span>
        {'.'}
        <br />
        {'You all wrote '}
        <span className='font-semibold'>
          {commentCount} {plural(commentCount, 'comment', 'comments')}
        </span>
        {' and assigned '}
        <span className='font-semibold'>
          {taskCount} {plural(taskCount, 'task', 'tasks')}
        </span>
        {'.'}
        <br />
        {locked ? (
          canUpgrade && (
            <>
              <StyledLink
                className='font-semibold'
                to={`/me/organizations/${orgId}`}
                onClick={onUpgrade}
              >
                Upgrade now
              </StyledLink>{' '}
              to see responses and discussion or review a summary
            </>
          )
        ) : (
          <>
            <StyledLink className='font-semibold' to={`/meet/${meetingId}/responses`}>
              See responses and discussions
            </StyledLink>
            {' or '}
            <StyledLink className='font-semibold' to={summaryURL}>
              review a summary
            </StyledLink>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventTeamPromptComplete
