import {ActionMeetingSidebar_viewer} from '../__generated__/ActionMeetingSidebar_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import ActionSidebarPhaseListItemChildren from './ActionSidebarPhaseListItemChildren'
import {useGotoStageId} from '../hooks/useMeeting'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../types/graphql'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
import NewMeetingSidebar from './NewMeetingSidebar'
import MeetingNavList from './MeetingNavList'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  viewer: ActionMeetingSidebar_viewer
}

const blackList: string[] = [NewMeetingPhaseTypeEnum.firstcall, NewMeetingPhaseTypeEnum.lastcall]

const ActionMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, viewer} = props
  const {id: viewerId, team} = viewer
  const {meetingSettings, newMeeting, agendaItems} = team!
  const {phaseTypes} = meetingSettings
  const {facilitatorUserId, facilitatorStageId, localPhase, phases} =
    newMeeting || UNSTARTED_MEETING
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      meetingType={MeetingTypeEnum.action}
      toggleSidebar={toggleSidebar}
      viewer={viewer}
    >
      <MeetingNavList>
        {phaseTypes
          .filter((phaseType) => !blackList.includes(phaseType))
          .map((phaseType) => {
            const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
            const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
              itemStage || {}
            const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
            const handleClick = () => {
              gotoStageId(itemStageId).catch()
              handleMenuClick()
            }
            const phaseCount = phaseType === NewMeetingPhaseTypeEnum.agendaitems && agendaItems ? agendaItems.length : undefined
            return (
              <NewMeetingSidebarPhaseListItem
                key={phaseType}
                handleClick={canNavigate ? handleClick : undefined}
                isActive={
                  phaseType === NewMeetingPhaseTypeEnum.agendaitems
                  ? blackList.includes(localPhaseType)
                  : localPhaseType === phaseType
                }
                isUnsyncedFacilitatorPhase={isUnsyncedFacilitatorPhase && phaseType === facilitatorPhaseType}
                phaseCount={phaseCount}
                phaseType={phaseType}
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
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default createFragmentContainer(ActionMeetingSidebar, {
  viewer: graphql`
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
        agendaItems {
          id
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
})
