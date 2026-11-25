import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {TeamHealthIntroPhase_meeting$key} from '~/__generated__/TeamHealthIntroPhase_meeting.graphql'
import type {TeamHealthIntroPhase_retroMeeting$key} from '~/__generated__/TeamHealthIntroPhase_retroMeeting.graphql'
import {ArrowForward, MonitorHeart, Schedule} from '~/ui/icons'
import useSetTeamHealthSpectateMutation from '../../mutations/useSetTeamHealthSpectateMutation'
import {Button} from '../../ui/Button/Button'
import {isNotNull} from '../../utils/predicates'
import RetroTeamHealthStart from '../RetroTeamHealth/RetroTeamHealthStart'
import CurrentTeamHealthStreak from './CurrentTeamHealthStreak'
import {getTeamHealthRespondents} from './getTeamHealthRespondents'
import TeamHealthProgress from './TeamHealthProgress'
import TeamHealthReminderPrompt from './TeamHealthReminderPrompt'

interface Props {
  // null in a retro while the team has no check to show
  meeting: TeamHealthIntroPhase_meeting$key | null
  gotoStageId: (stageId: string) => void
  // the retro the check shows in, if any
  retroMeeting?: TeamHealthIntroPhase_retroMeeting$key
}

const TeamHealthIntroPhase = (props: Props) => {
  const {meeting: meetingRef, gotoStageId, retroMeeting: retroMeetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthIntroPhase_meeting on TeamHealthMeeting {
        ...TeamHealthReminderPrompt_meeting
        id
        name
        respondentCount
        respondentUserIds
        currentStreak
        meetingSeriesId
        scheduledEndTime
        team {
          name
          teamMembers {
            userId
            user {
              preferredName
              picture
            }
          }
        }
        viewerMeetingMember {
          teamMember {
            isLead
          }
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        meetingMembers {
          id
          userId
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        phases {
          phaseType
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const retroMeeting = useFragment(
    graphql`
      fragment TeamHealthIntroPhase_retroMeeting on RetrospectiveMeeting {
        ...RetroTeamHealthStart_meeting
        startedTeamHealthMeeting {
          id
        }
      }
    `,
    retroMeetingRef ?? null
  )
  const [setSpectate] = useSetTeamHealthSpectateMutation()
  if (!meeting) {
    return retroMeeting ? <RetroTeamHealthStart meeting={retroMeeting} /> : null
  }
  const {
    id: meetingId,
    respondentCount,
    respondentUserIds,
    currentStreak,
    meetingSeriesId,
    scheduledEndTime,
    team,
    viewerMeetingMember,
    meetingMembers,
    phases
  } = meeting
  // a check the retro started has no schedule of its own: it closes with the retro
  const closesAt =
    retroMeeting?.startedTeamHealthMeeting?.id === meetingId
      ? 'this retro ends'
      : meetingSeriesId && scheduledEndTime
        ? dayjs(scheduledEndTime).format('ddd h:mm A')
        : null
  const responsePhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
  const responseStages = responsePhase?.stages.filter(isNotNull) ?? []
  const firstResponseStageId = responseStages[0]?.id
  const resultStageId = phases
    .find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')
    ?.stages.filter(isNotNull)[0]?.id
  const respondents = getTeamHealthRespondents(team.teamMembers, meetingMembers).map(
    (teamMember) => ({
      userId: teamMember.userId,
      preferredName: teamMember.user.preferredName,
      picture: teamMember.user.picture
    })
  )
  // the team lead collects the team's data, so they are the one who can sit the questions out
  const isLead = !!viewerMeetingMember?.teamMember.isLead
  const isSpectating = !!viewerMeetingMember?.isSpectating

  const onStart = () => {
    if (!firstResponseStageId) return
    if (isSpectating) {
      setSpectate({variables: {meetingId, isSpectating: false}})
    }
    gotoStageId(firstResponseStageId)
  }

  // the lead opts out again from here, so a mis-click never traps them in the question set
  const onCollectOnly = () => {
    setSpectate({variables: {meetingId, isSpectating: true}})
  }

  return (
    <div className='flex h-full w-full items-center justify-center overflow-y-auto px-6 py-12'>
      <div className='flex w-full max-w-md flex-col items-center rounded-3xl bg-surface-card px-6 py-10 text-center shadow-card-raised'>
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac-100 dark:bg-lilac-900'>
          <MonitorHeart className='text-grape-700 dark:text-lilac-200' />
        </div>
        <h1 className='mt-6 mb-2 font-bold text-4xl text-fg-primary'>Team Health</h1>
        <div className='mt-1 text-fg-secondary'>
          {team.name} · {responseStages.length} questions · about 2 minutes
        </div>
        {closesAt && (
          <div className='mt-4 flex items-center gap-2 rounded-full bg-surface-well px-4 py-2 font-semibold text-fg-secondary text-sm'>
            <Schedule fontSize='small' />
            {`Open until ${closesAt} · auto-reveals at close`}
          </div>
        )}
        <TeamHealthReminderPrompt meeting={meeting} />
        <CurrentTeamHealthStreak className='mt-6' streak={currentStreak} />
        <TeamHealthProgress
          className='mt-8'
          respondentCount={respondentCount}
          respondentUserIds={respondentUserIds}
          respondents={respondents}
        />
        <Button
          variant='primary'
          shape='default'
          size='lg'
          className='mt-8 gap-2'
          onClick={onStart}
        >
          {isSpectating ? 'Share your responses' : 'Start your response'}
          <ArrowForward />
        </Button>
        {isLead &&
          (isSpectating ? (
            resultStageId && (
              <Button
                variant='link'
                size='md'
                className='mt-3 font-bold text-accent'
                onClick={() => gotoStageId(resultStageId)}
              >
                Just collect my team's responses
              </Button>
            )
          ) : (
            <Button
              variant='link'
              size='md'
              className='mt-3 font-bold text-accent'
              onClick={onCollectOnly}
            >
              Don't share my responses
            </Button>
          ))}
        <div className='mt-8 text-fg-muted text-sm'>
          Anonymous · your individual answers are never shown to anyone
        </div>
      </div>
    </div>
  )
}

export default TeamHealthIntroPhase
