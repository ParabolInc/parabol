import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthSubmittedPhase_meeting$key} from '~/__generated__/TeamHealthSubmittedPhase_meeting.graphql'
import {CheckCircle, Schedule} from '~/ui/icons'
import useEndTeamHealthMutation from '../../mutations/useEndTeamHealthMutation'
import {Button} from '../../ui/Button/Button'
import {isNotNull} from '../../utils/predicates'
import {getTeamHealthRespondents} from './getTeamHealthRespondents'
import TeamHealthProgress from './TeamHealthProgress'
import TeamHealthRevealDialog from './TeamHealthRevealDialog'

interface Props {
  meeting: TeamHealthSubmittedPhase_meeting$key
  gotoStageId: (stageId: string) => void
}

const TeamHealthSubmittedPhase = (props: Props) => {
  const {meeting: meetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthSubmittedPhase_meeting on TeamHealthMeeting {
        id
        respondentCount
        team {
          teamMembers {
            userId
            user {
              preferredName
              picture
            }
          }
        }
        meetingMembers {
          id
          userId
          ... on TeamHealthMeetingMember {
            isSpectating
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
        phases {
          phaseType
          stages {
            id
            ... on TeamHealthResponseStage {
              viewerResponse {
                score
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {
    id: meetingId,
    respondentCount,
    team,
    meetingMembers,
    viewerMeetingMember,
    phases
  } = meeting
  const [endTeamHealth, revealing] = useEndTeamHealthMutation()
  const [isConfirmingReveal, setIsConfirmingReveal] = useState(false)
  // the team lead collects the team's data, so the reveal is theirs to call
  const isLead = !!viewerMeetingMember?.teamMember.isLead
  const isSpectating = !!viewerMeetingMember?.isSpectating
  const respondents = getTeamHealthRespondents(team.teamMembers, meetingMembers).map(
    (teamMember) => ({
      userId: teamMember.userId,
      preferredName: teamMember.user.preferredName,
      picture: teamMember.user.picture
    })
  )
  const responseStages =
    phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')?.stages.filter(isNotNull) ??
    []
  const answeredCount = responseStages.filter((stage) => stage.viewerResponse?.score != null).length
  const questionCount = responseStages.length
  const firstUnansweredStageId = responseStages.find(
    (stage) => stage.viewerResponse?.score == null
  )?.id
  const firstResponseStageId = responseStages[0]?.id
  const unansweredCount = questionCount - answeredCount
  const isMissingAnswers = !isSpectating && unansweredCount > 0

  const pendingCount = Math.max(0, respondents.length - respondentCount)

  // revealing the results is the act of ending the meeting, everyone stays in it to view them
  const onReveal = () => {
    endTeamHealth({variables: {meetingId}})
  }

  // nobody loses their chance to answer once the whole team is in, so skip the warning
  const onRevealClick = () => {
    if (pendingCount === 0) {
      onReveal()
      return
    }
    setIsConfirmingReveal(true)
  }

  const Icon = isSpectating ? Schedule : CheckCircle
  const title = isSpectating
    ? 'You’re sitting this one out'
    : isMissingAnswers
      ? 'Your answers are counted'
      : 'Your answers are in'
  const body = isSpectating
    ? 'As the team lead, you’re not answering this check-in. We’re waiting on the rest of the team before the results reveal.'
    : isMissingAnswers
      ? `You answered ${answeredCount} of ${questionCount} questions. They all count, and the rest give your team a fuller picture.`
      : 'Now we wait for the rest of the team before the results reveal.'

  return (
    <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6'>
      <div className='flex w-full max-w-2xl flex-col items-center rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-100 dark:bg-jade-900'>
          <Icon className='text-jade-500 dark:text-jade-300' />
        </div>
        <h1 className='mt-6 font-bold text-3xl text-fg-primary'>{title}</h1>
        <p className='mt-2 text-fg-secondary'>{body}</p>
        <TeamHealthProgress
          className='mt-8'
          respondentCount={respondentCount}
          respondents={respondents}
        />
        <div className='mt-8 flex flex-col items-center gap-3'>
          {isMissingAnswers && firstUnansweredStageId && (
            <Button
              variant='primary'
              shape='default'
              size='lg'
              onClick={() => gotoStageId(firstUnansweredStageId)}
            >
              {answeredCount === 0
                ? 'Answer the questions'
                : `Answer the last ${unansweredCount === 1 ? 'question' : `${unansweredCount} questions`}`}
            </Button>
          )}
          {isLead && (
            <Button
              variant={isMissingAnswers ? 'outline' : 'primary'}
              shape='default'
              size='lg'
              onClick={onRevealClick}
              disabled={revealing}
            >
              Reveal results
            </Button>
          )}
          {!isMissingAnswers && !isSpectating && firstResponseStageId && (
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
      <TeamHealthRevealDialog
        isOpen={isConfirmingReveal}
        onClose={() => setIsConfirmingReveal(false)}
        onConfirm={onReveal}
        submitting={revealing}
        pendingCount={pendingCount}
      />
    </div>
  )
}

export default TeamHealthSubmittedPhase
