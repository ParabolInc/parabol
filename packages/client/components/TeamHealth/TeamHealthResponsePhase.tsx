import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResponsePhase_meeting$key} from '~/__generated__/TeamHealthResponsePhase_meeting.graphql'
import useSetTeamHealthSpectateMutation from '../../mutations/useSetTeamHealthSpectateMutation'
import {isNotNull} from '../../utils/predicates'
import {getOrderedTeamHealthCategories} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthEndedResponseCard from './TeamHealthEndedResponseCard'
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
        endedAt
        organization {
          useAI
        }
        viewerMeetingMember {
          user {
            preferredName
            picture
          }
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
            ...TeamHealthEndedResponseCard_stage
          }
        }
      }
    `,
    meetingRef
  )
  const {
    id: meetingId,
    endedAt,
    organization,
    viewerMeetingMember,
    localStage,
    phases,
    template
  } = meeting
  // an anonymous comment is reworded by AI before the team reads it, so without AI the only honest
  // option is to send it as written
  const aiDisabledReason = !window.__ACTION__.hasOpenAI
    ? 'This Parabol instance has AI turned off, so comments are shared exactly as written.'
    : !organization.useAI
      ? 'Your organization has AI turned off, so comments are shared exactly as written.'
      : null
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    template?.availableQuestionPacks ?? []
  ).map((category) => category.id)
  const [setSpectate] = useSetTeamHealthSpectateMutation()
  const responsePhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
  const responseStages = responsePhase?.stages.filter(isNotNull) ?? []
  const resultStageId = phases
    .find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')
    ?.stages.filter(isNotNull)[0]?.id

  const currentIdx = responseStages.findIndex((stage) => stage.id === localStage?.id)
  const currentStage = responseStages[currentIdx]
  const isLast = currentIdx === responseStages.length - 1

  // the team lead is excluded from the questions unless they opt in. They still see every
  // question, just read-only, so they know what they are asking the team
  const isSpectating = !!viewerMeetingMember?.isSpectating
  const onShareResponses = () => {
    setSpectate({variables: {meetingId, isSpectating: false}})
  }

  if (!currentStage) return null

  const onNext = () => {
    if (isLast) {
      if (resultStageId) gotoStageId(resultStageId)
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
      {endedAt ? (
        <TeamHealthEndedResponseCard
          key={currentStage.id}
          stage={currentStage}
          stageIndex={currentIdx}
          stageCount={responseStages.length}
          orderedCategoryIds={orderedCategoryIds}
          onPrev={onPrev}
          onNext={onNext}
        />
      ) : (
        <TeamHealthResponseCard
          key={currentStage.id}
          meetingId={meetingId}
          stage={currentStage}
          stageIndex={currentIdx}
          stageCount={responseStages.length}
          orderedCategoryIds={orderedCategoryIds}
          preferredName={viewerMeetingMember?.user.preferredName ?? ''}
          picture={viewerMeetingMember?.user.picture ?? ''}
          aiDisabledReason={aiDisabledReason}
          onShareResponses={isSpectating ? onShareResponses : undefined}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </div>
  )
}

export default TeamHealthResponsePhase
