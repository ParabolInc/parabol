import {RetroMeetingSidebar_viewer} from '__generated__/RetroMeetingSidebar_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem'
import RetroSidebarPhaseListItemChildren from 'universal/components/RetroSidebarPhaseListItemChildren'
import {useGotoStageId} from 'universal/hooks/useMeeting'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import getSidebarItemStage from 'universal/utils/getSidebarItemStage'
import findStageById from 'universal/utils/meetings/findStageById'
import sidebarCanAutoCollapse from 'universal/utils/meetings/sidebarCanAutoCollapse'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import NewMeetingSidebar from './NewMeetingSidebar'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  toggleSidebar: () => void
  viewer: RetroMeetingSidebar_viewer
}

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
})

const RetroMeetingSidebar = (props: Props) => {
  const {gotoStageId, toggleSidebar, viewer} = props
  const {id: viewerId, team} = viewer
  const {isMeetingSidebarCollapsed, meetingSettings, newMeeting} = team!
  const {phaseTypes} = meetingSettings
  const {facilitatorUserId, facilitatorStageId, localPhase, phases} =
    newMeeting || UNSTARTED_MEETING
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  return (
    <NewMeetingSidebar
      meetingType={MeetingTypeEnum.retrospective}
      isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
      toggleSidebar={toggleSidebar}
      viewer={viewer}
    >
      <NavList>
        {phaseTypes.map((phaseType, idx) => {
          const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
          const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
            itemStage || {}
          const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
          const handleClick = () => {
            gotoStageId(itemStageId).catch()
            if (sidebarCanAutoCollapse()) toggleSidebar()
          }
          return (
            <NewMeetingSidebarPhaseListItem
              key={phaseType}
              phaseType={phaseType}
              listPrefix={String(idx + 1)}
              isActive={
                phaseType === NewMeetingPhaseTypeEnum.discuss ? false : localPhaseType === phaseType
              }
              isFacilitatorPhaseGroup={facilitatorPhaseType === phaseType}
              handleClick={canNavigate ? handleClick : undefined}
            >
              <RetroSidebarPhaseListItemChildren
                gotoStageId={gotoStageId}
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
  RetroMeetingSidebar,
  graphql`
    fragment RetroMeetingSidebar_viewer on User {
      ...RetroSidebarPhaseListItemChildren_viewer
      ...NewMeetingSidebar_viewer
      id
      team(teamId: $teamId) {
        isMeetingSidebarCollapsed
        id
        meetingSettings(meetingType: retrospective) {
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
