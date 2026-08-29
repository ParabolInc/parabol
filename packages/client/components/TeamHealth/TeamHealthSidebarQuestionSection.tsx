import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthSidebarQuestionSection_meeting$key} from '~/__generated__/TeamHealthSidebarQuestionSection_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import {CheckCircle} from '~/ui/icons'
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
        localStage {
          id
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
  const {localStage, phases} = meeting
  const stages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')?.stages ?? []
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
