import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthSidebarQuestionSection_meeting$key} from '~/__generated__/TeamHealthSidebarQuestionSection_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import {Cancel, CheckCircle} from '~/ui/icons'
import MeetingSidebarPhaseItemChild from '../MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from '../MeetingSubnavItem'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: TeamHealthSidebarQuestionSection_meeting$key
}

const TeamHealthSidebarQuestionSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthSidebarQuestionSection_meeting on TeamHealthMeeting {
        endedAt
        localPhase {
          phaseType
        }
        localStage {
          id
        }
        viewerMeetingMember {
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        phases {
          phaseType
          stages {
            id
            isNavigable
            ... on TeamHealthResponseStage {
              # aliased for the same reason as TeamHealthResponseCard: NewMeetingStage.question is
              # a String on the embedded TeamHealthStage, so the raw key would conflict
              healthQuestion: question {
                question
              }
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
  const {endedAt, localPhase, localStage, viewerMeetingMember, phases} = meeting
  const stages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')?.stages ?? []
  // the waiting room is where a partial response first becomes a problem, so that is where the
  // unanswered questions get called out
  const isWaitingToReveal =
    !endedAt && localPhase?.phaseType === 'TEAM_HEALTH_RESULT' && !viewerMeetingMember?.isSpectating
  const handleClick = (stageId: string) => {
    gotoStageId(stageId).catch(() => {
      /*ignore*/
    })
    handleMenuClick()
  }
  return (
    <MeetingSidebarPhaseItemChild>
      <div className='overflow-auto pb-2'>
        {stages.map((stage, idx) => {
          const {id: stageId, isNavigable, healthQuestion, viewerResponse} = stage
          return (
            <MeetingSubnavItem
              key={stageId}
              isActive={localStage?.id === stageId}
              isDisabled={!isNavigable}
              isDragging={false}
              isUnsyncedFacilitatorStage={false}
              metaContent={
                viewerResponse?.score != null ? (
                  <CheckCircle className='size-4.5 text-jade-500' />
                ) : isWaitingToReveal ? (
                  <span className='relative flex size-4.5 items-center justify-center'>
                    {/* the X is knocked out of the icon, so a white disc sits behind it */}
                    <span className='absolute size-2.5 rounded-full bg-white' />
                    <Cancel aria-label='Unanswered' className='relative size-4.5 text-tomato-500' />
                  </span>
                ) : null
              }
              onClick={() => handleClick(stageId)}
            >
              {`${idx + 1}. ${healthQuestion?.question ?? ''}`}
            </MeetingSubnavItem>
          )
        })}
      </div>
    </MeetingSidebarPhaseItemChild>
  )
}

export default TeamHealthSidebarQuestionSection
