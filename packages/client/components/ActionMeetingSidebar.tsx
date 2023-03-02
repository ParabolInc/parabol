import graphql from 'babel-plugin-relay/macro'
import React, {Fragment} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useGotoStageId from '../hooks/useGotoStageId'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import {
  ActionMeetingSidebar_meeting$key,
  NewMeetingPhaseTypeEnum
} from '../__generated__/ActionMeetingSidebar_meeting.graphql'
import ActionSidebarPhaseListItemChildren from './ActionSidebarPhaseListItemChildren'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: ActionMeetingSidebar_meeting$key
}

const blackList: NewMeetingPhaseTypeEnum[] = ['firstcall', 'lastcall']
const collapsiblePhases: NewMeetingPhaseTypeEnum[] = ['checkin', 'updates', 'agendaitems']

const ActionMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ActionMeetingSidebar_meeting on ActionMeeting {
        ...ActionSidebarPhaseListItemChildren_meeting
        ...NewMeetingSidebar_meeting
        settings {
          phaseTypes
        }
        facilitatorUserId
        facilitatorStageId
        localPhase {
          phaseType
        }
        localStage {
          id
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
        team {
          agendaItems {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {team, settings} = meeting
  const {agendaItems} = team
  const {phaseTypes} = settings
  const {facilitatorUserId, facilitatorStageId, localPhase, localStage, phases} = meeting
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes?.phase?.phaseType ?? ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  const isUnsyncedFacilitatorStage = localStage ? localStage.id !== facilitatorStageId : undefined
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      toggleSidebar={toggleSidebar}
      meeting={meeting}
    >
      <MeetingNavList>
        {phaseTypes
          .filter((phaseType) => !blackList.includes(phaseType))
          .map((phaseType) => {
            const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
            const {
              id: itemStageId = '',
              isNavigable = false,
              isNavigableByFacilitator = false
            } = itemStage || {}
            const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
            const handleClick = () => {
              gotoStageId(itemStageId).catch()
              handleMenuClick()
            }
            const phaseCount =
              phaseType === 'agendaitems' && agendaItems ? agendaItems.length : undefined
            return (
              <Fragment key={phaseType}>
                <NewMeetingSidebarPhaseListItem
                  handleClick={canNavigate ? handleClick : undefined}
                  isActive={
                    phaseType === 'agendaitems'
                      ? localPhaseType !== '' && blackList.includes(localPhaseType)
                      : localPhaseType === phaseType
                  }
                  isCollapsible={collapsiblePhases.includes(phaseType)}
                  isFacilitatorPhase={phaseType === facilitatorPhaseType}
                  isUnsyncedFacilitatorPhase={
                    isUnsyncedFacilitatorPhase && phaseType === facilitatorPhaseType
                  }
                  isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                  key={phaseType}
                  phaseCount={phaseCount}
                  phaseType={phaseType}
                />
                <ActionSidebarPhaseListItemChildren
                  gotoStageId={gotoStageId}
                  handleMenuClick={handleMenuClick}
                  phaseType={phaseType}
                  meeting={meeting}
                />
              </Fragment>
            )
          })}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default ActionMeetingSidebar
