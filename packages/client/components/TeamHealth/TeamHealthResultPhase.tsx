import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultPhase_meeting$key} from '~/__generated__/TeamHealthResultPhase_meeting.graphql'
import {isNotNull} from '../../utils/predicates'
import {getOrderedTeamHealthCategories} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthResultCard from './TeamHealthResultCard'

interface Props {
  meeting: TeamHealthResultPhase_meeting$key
  gotoStageId: (stageId: string) => void
}

const TeamHealthResultPhase = (props: Props) => {
  const {meeting: meetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthResultPhase_meeting on TeamHealthMeeting {
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
            ...TeamHealthResultCard_stage
          }
        }
      }
    `,
    meetingRef
  )
  const {localStage, phases, template} = meeting
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    template?.availableQuestionPacks ?? []
  ).map((category) => category.id)
  const resultStages =
    phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')?.stages.filter(isNotNull) ?? []
  const currentIdx = resultStages.findIndex((stage) => stage.id === localStage?.id)
  const currentStage = resultStages[currentIdx]
  if (!currentStage) return null

  const onNext = () => {
    const nextStage = resultStages[currentIdx + 1]
    if (nextStage) gotoStageId(nextStage.id)
  }
  const onPrev = () => {
    const prevStage = resultStages[currentIdx - 1]
    if (prevStage) gotoStageId(prevStage.id)
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-6 py-10'>
      <TeamHealthResultCard
        key={currentStage.id}
        stage={currentStage}
        stageIndex={currentIdx}
        stageCount={resultStages.length}
        orderedCategoryIds={orderedCategoryIds}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  )
}

export default TeamHealthResultPhase
