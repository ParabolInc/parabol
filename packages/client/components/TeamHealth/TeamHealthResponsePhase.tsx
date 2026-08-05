import {ArrowForward} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResponsePhase_meeting$key} from '~/__generated__/TeamHealthResponsePhase_meeting.graphql'
import useSetTeamHealthSpectateMutation from '../../mutations/useSetTeamHealthSpectateMutation'
import {Button} from '../../ui/Button/Button'
import {isNotNull} from '../../utils/predicates'
import {getOrderedTeamHealthCategories} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthResponseCard from './TeamHealthResponseCard'

interface Props {
  meeting: TeamHealthResponsePhase_meeting$key
  gotoStageId: (stageId: string) => void
}

const TeamHealthResponsePhase = (props: Props) => {
  const {meeting: meetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthResponsePhase_meeting on TeamHealthMeeting {
        id
        viewerMeetingMember {
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        localStage {
          id
        }
        template {
          availableQuestionPacks {
            questions {
              category {
                id
                name
                createdAt
              }
            }
          }
        }
        phases {
          phaseType
          stages {
            id
            ...TeamHealthResponseCard_stage
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, viewerMeetingMember, localStage, phases, template} = meeting
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    template?.availableQuestionPacks ?? []
  ).map((category) => category.id)
  const [setSpectate] = useSetTeamHealthSpectateMutation()
  const responsePhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
  const responseStages = responsePhase?.stages.filter(isNotNull) ?? []
  const submittedStageId = phases
    .find((phase) => phase.phaseType === 'TEAM_HEALTH_SUBMITTED')
    ?.stages.filter(isNotNull)[0]?.id
  const firstResponseStageId = responseStages[0]?.id

  const currentIdx = responseStages.findIndex((stage) => stage.id === localStage?.id)
  const currentStage = responseStages[currentIdx]
  const isLast = currentIdx === responseStages.length - 1

  // the owner is a data collector, excluded from the questions unless they opt in
  if (viewerMeetingMember?.isSpectating) {
    const onShare = () => {
      if (!firstResponseStageId) return
      setSpectate({variables: {meetingId, isSpectating: false}})
      gotoStageId(firstResponseStageId)
    }
    return (
      <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6'>
        <div className='flex w-full max-w-2xl flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm'>
          <h2 className='font-bold text-2xl text-slate-900'>You're the manager here</h2>
          <p className='mt-3 text-slate-600'>
            You're collecting the team's health data, so you're excluded from the questions. If
            you'd like to answer them too, you can share your responses.
          </p>
          <Button variant='secondary' shape='default' size='lg' className='mt-6' onClick={onShare}>
            Share your responses
          </Button>
        </div>
      </div>
    )
  }

  if (!currentStage) return null

  const onNext = () => {
    if (isLast) {
      if (submittedStageId) gotoStageId(submittedStageId)
      return
    }
    const nextStage = responseStages[currentIdx + 1]
    if (nextStage) gotoStageId(nextStage.id)
  }
  const onPrev = () => {
    const prevStage = responseStages[currentIdx - 1]
    if (prevStage) gotoStageId(prevStage.id)
  }

  return (
    <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6'>
      <TeamHealthResponseCard
        key={currentStage.id}
        meetingId={meetingId}
        stage={currentStage}
        stageIndex={currentIdx}
        stageCount={responseStages.length}
        orderedCategoryIds={orderedCategoryIds}
      />
      <div className='mt-6 flex w-full max-w-2xl justify-between'>
        {currentIdx === 0 ? (
          <div />
        ) : (
          <Button variant='ghost' shape='pill' size='md' onClick={onPrev}>
            Back
          </Button>
        )}
        <Button variant='primary' shape='pill' size='md' className='gap-1' onClick={onNext}>
          {isLast ? 'Submit' : 'Next'}
          <ArrowForward className='size-5' />
        </Button>
      </div>
    </div>
  )
}

export default TeamHealthResponsePhase
