import {ActionMeetingSidebar_viewer} from '__generated__/ActionMeetingSidebar_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem'
import ActionSidebarPhaseListItemChildren from 'universal/components/ActionSidebarPhaseListItemChildren'
import {useGotoStageId} from 'universal/hooks/useMeeting'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import getSidebarItemStage from 'universal/utils/getSidebarItemStage'
import findStageById from 'universal/utils/meetings/findStageById'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import NewMeetingSidebar from './NewMeetingSidebar'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  viewer: ActionMeetingSidebar_viewer
}

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
})

const blackList: string[] = [NewMeetingPhaseTypeEnum.firstcall, NewMeetingPhaseTypeEnum.lastcall]

const ActionMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, viewer} = props
  const {id: viewerId, team} = viewer
  const {meetingSettings, newMeeting} = team!
  const {phaseTypes} = meetingSettings
  const {facilitatorUserId, facilitatorStageId, localPhase, phases} =
    newMeeting || UNSTARTED_MEETING
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      meetingType={MeetingTypeEnum.action}
      toggleSidebar={toggleSidebar}
      viewer={viewer}
    >
      <NavList>
        {phaseTypes
          .filter((phaseType) => !blackList.includes(phaseType))
          .map((phaseType, idx) => {
            const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
            const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
              itemStage || {}
            const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
            const handleClick = () => {
              gotoStageId(itemStageId).catch()
              handleMenuClick()
            }
            return (
              <NewMeetingSidebarPhaseListItem
                key={phaseType}
                phaseType={phaseType}
                listPrefix={String(idx + 1)}
                isActive={
                  phaseType === NewMeetingPhaseTypeEnum.agendaitems
                    ? blackList.includes(localPhaseType)
                    : localPhaseType === phaseType
                }
                isFacilitatorPhaseGroup={
                  facilitatorPhaseType === phaseType ||
                  (phaseType === NewMeetingPhaseTypeEnum.agendaitems &&
                    blackList.includes(facilitatorPhaseType))
                }
                handleClick={canNavigate ? handleClick : undefined}
              >
                <ActionSidebarPhaseListItemChildren
                  gotoStageId={gotoStageId}
                  handleMenuClick={handleMenuClick}
                  phaseType={phaseType}
                  viewer={viewer}
                />
              </NewMeetingSidebarPhaseListItem>
            )
          })}
      </NavList>
    </NewMeetingSidebar>
  )
}

export default createFragmentContainer(
  ActionMeetingSidebar,
  graphql`
    fragment ActionMeetingSidebar_viewer on User {
      ...ActionSidebarPhaseListItemChildren_viewer
      ...NewMeetingSidebar_viewer
      id
      team(teamId: $teamId) {
        isMeetingSidebarCollapsed
        id
        meetingSettings(meetingType: action) {
          phaseTypes
        }
        newMeeting {
          meetingId: id
          facilitatorUserId
          facilitatorStageId
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
              isComplete
              isNavigable
              isNavigableByFacilitator
            }
          }
        }
      }
    }
  `
)
