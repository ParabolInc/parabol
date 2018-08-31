import {NewMeetingSidebarPhaseList_viewer} from '__generated__/NewMeetingSidebarPhaseList_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem'
import NewMeetingSidebarPhaseListItemChildren from 'universal/components/NewMeetingSidebarPhaseListItemChildren'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {AGENDA_ITEMS, DISCUSS, LOBBY} from 'universal/utils/constants'
import findStageById from 'universal/utils/meetings/findStageById'
import {phaseTypeToPhaseGroup} from 'universal/utils/meetings/lookups'
import sidebarCanAutoCollapse from 'universal/utils/meetings/sidebarCanAutoCollapse'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
})

interface Props extends WithAtmosphereProps {
  gotoStageId: (stageId: string) => void
  viewer: NewMeetingSidebarPhaseList_viewer
}

type NewMeeting = NonNullable<Props['viewer']['team']['newMeeting']>

const getItemStage = (name: string, phases: NewMeeting['phases'], facilitatorStageId: string) => {
  const stageRes = findStageById(phases, facilitatorStageId)
  if (!stageRes) return undefined
  const {stage, phase} = stageRes
  if (phase.phaseType === name) {
    return stage
  }
  const itemPhase = phases.find(({phaseType}) => phaseType === name)
  return itemPhase && itemPhase.stages[0]
}

const NewMeetingSidebarPhaseList = (props: Props) => {
  const {gotoStageId, viewer} = props
  const {
    viewerId,
    team: {
      meetingSettings: {phaseTypes},
      newMeeting
    }
  } = viewer
  const meeting = newMeeting || UNSTARTED_MEETING
  const {facilitatorUserId, facilitatorStageId, localPhase, phases} = meeting
  const localGroup = phaseTypeToPhaseGroup[localPhase && localPhase.phaseType]
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const {phase: facilitatorPhase = {phaseType: LOBBY}} = facilitatorStageRes || {}
  const facilitatorPhaseGroup = phaseTypeToPhaseGroup[facilitatorPhase.phaseType]
  const isViewerFacilitator = facilitatorUserId === viewerId
  const toggleSidebar = () => {
    const {
      atmosphere,
      viewer: {
        team: {teamId, isMeetingSidebarCollapsed}
      }
    } = props
    commitLocalUpdate(atmosphere, (store) => {
      const team = store.get(teamId)
      if (!team) return
      team.setValue(!isMeetingSidebarCollapsed, 'isMeetingSidebarCollapsed')
    })
  }
  return (
    <NavList>
      {phaseTypes.map((phaseType, idx) => {
        const itemStage = getItemStage(phaseType, phases, facilitatorStageId)
        const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
          itemStage || {}
        const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
        const handleClick = () => {
          gotoStageId(itemStageId)
          if (sidebarCanAutoCollapse()) toggleSidebar()
        }
        // when a primary nav item has sub-items, we want to show the sub-items as active, not the parent (TA)
        const activeHasSubItems = phaseType === DISCUSS || phaseType === AGENDA_ITEMS
        return (
          <NewMeetingSidebarPhaseListItem
            key={phaseType}
            phaseType={phaseType}
            listPrefix={String(idx + 1)}
            isActive={!activeHasSubItems && localGroup === phaseType}
            isFacilitatorPhaseGroup={facilitatorPhaseGroup === phaseType}
            handleClick={canNavigate ? handleClick : undefined}
          >
            <NewMeetingSidebarPhaseListItemChildren
              gotoStageId={gotoStageId}
              phaseType={phaseType}
              viewer={viewer}
            />
          </NewMeetingSidebarPhaseListItem>
        )
      })}
    </NavList>
  )
}

export default createFragmentContainer(
  withAtmosphere(NewMeetingSidebarPhaseList),
  graphql`
    fragment NewMeetingSidebarPhaseList_viewer on User {
      ...NewMeetingSidebarPhaseListItemChildren_viewer
      viewerId: id
      team(teamId: $teamId) {
        isMeetingSidebarCollapsed
        teamId: id
        meetingSettings(meetingType: $meetingType) {
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
