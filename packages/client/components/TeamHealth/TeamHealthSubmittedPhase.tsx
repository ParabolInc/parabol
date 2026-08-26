import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthSubmittedPhase_meeting$key} from '~/__generated__/TeamHealthSubmittedPhase_meeting.graphql'
import {CheckCircle} from '~/ui/icons'
import useAtmosphere from '../../hooks/useAtmosphere'
import useEndTeamHealthMutation from '../../mutations/useEndTeamHealthMutation'
import {Button} from '../../ui/Button/Button'
import {isNotNull} from '../../utils/predicates'
import TeamHealthProgress from './TeamHealthProgress'

interface Props {
  meeting: TeamHealthSubmittedPhase_meeting$key
  gotoStageId: (stageId: string) => void
}

const TeamHealthSubmittedPhase = (props: Props) => {
  const {meeting: meetingRef, gotoStageId} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const meeting = useFragment(
    graphql`
      fragment TeamHealthSubmittedPhase_meeting on TeamHealthMeeting {
        id
        facilitatorUserId
        respondentCount
        eligibleCount
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
  const {id: meetingId, facilitatorUserId, respondentCount, eligibleCount, phases} = meeting
  const [endTeamHealth, revealing] = useEndTeamHealthMutation()
  const isOwner = viewerId === facilitatorUserId
  const firstResponseStageId = phases
    .find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
    ?.stages.filter(isNotNull)[0]?.id

  // revealing the results is the act of ending the meeting, which sends everyone to the summary
  const onReveal = () => {
    endTeamHealth({variables: {meetingId}})
  }

  return (
    <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6'>
      <div className='flex w-full max-w-2xl flex-col items-center rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-100 dark:bg-jade-900'>
          <CheckCircle className='text-jade-500 dark:text-jade-300' />
        </div>
        <h1 className='mt-6 font-bold text-3xl text-fg-primary'>You're all set</h1>
        <p className='mt-2 text-fg-secondary'>
          Your answers are in. Now we wait for the rest of the team before the results reveal.
        </p>
        <TeamHealthProgress
          className='mt-8'
          respondentCount={respondentCount}
          total={eligibleCount}
        />
        <div className='mt-8 flex flex-col items-center gap-3'>
          {isOwner && (
            <Button
              variant='primary'
              shape='default'
              size='lg'
              onClick={onReveal}
              disabled={revealing}
            >
              Reveal results
            </Button>
          )}
          {firstResponseStageId && (
            <Button
              variant='link'
              size='md'
              className='font-bold text-accent'
              onClick={() => gotoStageId(firstResponseStageId)}
            >
              Change my answers
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamHealthSubmittedPhase
