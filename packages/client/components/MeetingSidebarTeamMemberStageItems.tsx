import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {MeetingSidebarTeamMemberStageItems_meeting$key} from '~/__generated__/MeetingSidebarTeamMemberStageItems_meeting.graphql'
import type {NewMeetingPhaseTypeEnum} from '../__generated__/ActionMeeting_meeting.graphql'
import Avatar from '../components/Avatar/Avatar'
import MeetingSubnavItem from '../components/MeetingSubnavItem'
import useAnimatedPhaseListChildren from '../hooks/useAnimatedPhaseListChildren'
import useAtmosphere from '../hooks/useAtmosphere'
import type useGotoStageId from '../hooks/useGotoStageId'
import {cn} from '../ui/cn'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: MeetingSidebarTeamMemberStageItems_meeting$key
  phaseType: NewMeetingPhaseTypeEnum
}

const MeetingSidebarTeamMemberStageItems = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef, phaseType} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingSidebarTeamMemberStageItems_meeting on NewMeeting {
        facilitatorStageId
        facilitatorUserId
        id
        localPhase {
          ...MeetingSidebarTeamMemberStageItems_phase @relay(mask: false)
        }
        localStage {
          id
        }
        phases {
          ...MeetingSidebarTeamMemberStageItems_phase @relay(mask: false)
        }
      }
    `,
    meetingRef
  )
  const {facilitatorStageId, facilitatorUserId, localPhase, localStage, phases} = meeting
  const sidebarPhase = phases.find((phase) => phase.phaseType === phaseType)
  const localStageId = (localStage && localStage.id) || ''
  const gotoStage = (teamMemberId: string) => () => {
    const teamMemberStage =
      sidebarPhase && sidebarPhase.stages.find((stage) => stage.teamMemberId === teamMemberId)
    const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
    gotoStageId(teamMemberStageId).catch(() => {
      /*ignore*/
    })
    handleMenuClick()
  }
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isActive = !!(localPhase && localPhase.phaseType === sidebarPhase?.phaseType)
  const isViewerFacilitator = viewerId === facilitatorUserId
  const childItemCount = sidebarPhase ? sidebarPhase.stages.length : 0
  const {height, ref} = useAnimatedPhaseListChildren(isActive, childItemCount)
  return (
    <MeetingSidebarPhaseItemChild minHeight={height} height={height}>
      <div
        className={cn(
          'flex h-full w-full flex-col',
          isActive ? 'overflow-auto' : 'overflow-hidden'
        )}
        ref={ref}
      >
        {sidebarPhase?.stages.map((stage) => {
          const {
            id: stageId,
            isComplete,
            teamMemberId,
            teamMember,
            isNavigableByFacilitator,
            isNavigable
          } = stage
          if (!teamMember || !teamMemberId) {
            return null
          }
          const {user} = teamMember
          const {picture, preferredName} = user
          const isLocalStage = localStageId === stageId
          const isFacilitatorStage = facilitatorStageId === stageId
          const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
          return (
            <MeetingSubnavItem
              key={stageId}
              metaContent={
                <div className='w-8'>
                  <Avatar picture={picture} className='h-6 w-6' />
                </div>
              }
              isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
              onClick={gotoStage(teamMemberId)}
              isActive={localStageId === stageId}
              isComplete={isComplete}
              isDragging={false}
              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
            >
              {preferredName}
            </MeetingSubnavItem>
          )
        })}
      </div>
    </MeetingSidebarPhaseItemChild>
  )
}

graphql`
  fragment MeetingSidebarTeamMemberStageItems_phase on NewMeetingPhase {
    id
    phaseType
    stages {
      id
      isComplete
      isComplete
      isNavigable
      isNavigableByFacilitator
      ... on NewMeetingTeamMemberStage {
        teamMemberId
        teamMember {
          user {
            picture
            preferredName
          }
        }
      }
    }
  }
`

export default MeetingSidebarTeamMemberStageItems
