import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {TeamHealthIntroPhase_meeting$key} from '~/__generated__/TeamHealthIntroPhase_meeting.graphql'
import {ArrowForward, MonitorHeart, Schedule} from '~/ui/icons'
import NewMeetingAvatarGroup from '../../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import useSetTeamHealthSpectateMutation from '../../mutations/useSetTeamHealthSpectateMutation'
import logoMarkPurple from '../../styles/theme/images/brand/mark-color.svg'
import {Button} from '../../ui/Button/Button'
import {isNotNull} from '../../utils/predicates'
import CurrentTeamHealthStreak from './CurrentTeamHealthStreak'
import TeamHealthProgress from './TeamHealthProgress'

interface Props {
  meeting: TeamHealthIntroPhase_meeting$key
  gotoStageId: (stageId: string) => void
}

const TeamHealthIntroPhase = (props: Props) => {
  const {meeting: meetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthIntroPhase_meeting on TeamHealthMeeting {
        id
        name
        respondentCount
        currentStreak
        meetingSeriesId
        scheduledEndTime
        team {
          name
        }
        viewerMeetingMember {
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        meetingMembers {
          id
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
        ...NewMeetingAvatarGroup_meeting
      }
    `,
    meetingRef
  )
  const {
    id: meetingId,
    respondentCount,
    currentStreak,
    meetingSeriesId,
    scheduledEndTime,
    team,
    viewerMeetingMember,
    meetingMembers,
    phases
  } = meeting
  const [setSpectate] = useSetTeamHealthSpectateMutation()
  const responsePhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
  const responseStages = responsePhase?.stages.filter(isNotNull) ?? []
  const firstResponseStageId = responseStages[0]?.id
  // spectators (the owner, by default) are excluded from the total until they opt in
  const total = meetingMembers.filter((member) => !member.isSpectating).length

  const onStart = () => {
    if (!firstResponseStageId) return
    if (viewerMeetingMember?.isSpectating) {
      setSpectate({variables: {meetingId, isSpectating: false}})
    }
    gotoStageId(firstResponseStageId)
  }

  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-y-auto px-6 py-12'>
      <Link className='absolute top-6 left-6' title='My Dashboard' to='/meetings'>
        <img className='w-8' crossOrigin='' alt='Parabol' src={logoMarkPurple} />
      </Link>
      <div className='absolute top-6 right-6'>
        <NewMeetingAvatarGroup meetingRef={meeting} />
      </div>
      <div className='flex w-full max-w-md flex-col items-center rounded-3xl bg-surface-card px-6 py-10 text-center shadow-card-raised'>
        <div className='flex h-16 w-10 items-center justify-center rounded-2xl bg-lilac-100 dark:bg-lilac-900'>
          <MonitorHeart className='text-grape-700 dark:text-lilac-200' fontSize='large' />
        </div>
        <h1 className='mt-6 mb-2 font-bold text-4xl text-fg-primary'>Team Health</h1>
        <div className='mt-1 text-fg-secondary'>
          {team.name} · {responseStages.length} questions · about 2 minutes
        </div>
        {meetingSeriesId && scheduledEndTime && (
          <div className='mt-4 flex items-center gap-2 rounded-full bg-surface-well px-4 py-2 font-semibold text-fg-secondary text-sm'>
            <Schedule fontSize='small' />
            Open until {dayjs(scheduledEndTime).format('ddd h:mm A')} · auto-reveals at close
          </div>
        )}
        <CurrentTeamHealthStreak className='mt-6' streak={currentStreak} />
        <TeamHealthProgress className='mt-8' respondentCount={respondentCount} total={total} />
        <Button
          variant='primary'
          shape='default'
          size='lg'
          className='mt-8 gap-2'
          onClick={onStart}
        >
          Start your response
          <ArrowForward />
        </Button>
        <div className='mt-8 text-fg-muted text-sm'>
          Anonymous · your individual answers are never shown to anyone
        </div>
      </div>
    </div>
  )
}

export default TeamHealthIntroPhase
