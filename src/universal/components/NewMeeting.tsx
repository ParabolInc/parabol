import {NewMeeting_viewer} from '__generated__/NewMeeting_viewer.graphql'
import React, {ReactNode} from 'react'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingSidebarLayout from 'universal/components/MeetingSidebarLayout'
import NewMeetingPhaseHeading from 'universal/components/NewMeetingPhaseHeading/NewMeetingPhaseHeading'
import {useGotoNext, useGotoStageId} from 'universal/hooks/newMeeting'
import useMeetingWrapper from 'universal/hooks/useMeetingWrapper'
import NewMeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingSidebarMediaQuery, meetingSidebarWidth} from 'universal/styles/meeting'
import ui from 'universal/styles/ui'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'

const MeetingContainer = styled('div')({
  backgroundColor: ui.backgroundColor,
  display: 'flex',
  height: '100vh',
  overflowX: 'auto'
})

const MeetingArea = styled('div')({
  display: 'flex',
  width: '100%'
  // This just seemed wrong & blocked modals
  // zIndex: 100
})

const MeetingContent = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const LayoutPusher = styled('div')(
  ({isMeetingSidebarCollapsed}: {isMeetingSidebarCollapsed: boolean}) => ({
    display: 'none',

    [meetingSidebarMediaQuery]: {
      display: 'block',
      flexShrink: 0,
      transition: `width ${ui.transition[0]}`,
      width: isMeetingSidebarCollapsed ? 0 : meetingSidebarWidth
    }
  })
)

const MeetingAreaHeader = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  padding: '0 1rem 1rem',
  width: '100%',
  [minWidthMediaQueries[3]]: {
    padding: '0 1rem 2rem'
  }
})

interface Props {
  children: ReactNode
  gotoStageId: ReturnType<typeof useGotoStageId>
  meetingType: MeetingTypeEnum
  phaseTypes: ReadonlyArray<NewMeetingPhaseTypeEnum>
  viewer: NewMeeting_viewer
}

export interface NewMeetingTypeProps {
  handleGotoNext: ReturnType<typeof useGotoNext>
}

const NewMeeting = (props: Props) => {
  const {children, gotoStageId, meetingType, phaseTypes, viewer} = props
  const {featureFlags} = viewer
  const {video: allowVideo} = featureFlags
  const team = viewer.team!
  const {toggleSidebar, streams, swarm} = useMeetingWrapper(team)
  const {isMeetingSidebarCollapsed, newMeeting} = team
  const {facilitatorStageId, localStage} = newMeeting || UNSTARTED_MEETING
  const inSync = localStage ? localStage.id === facilitatorStageId : true
  return (
    <MeetingContainer>
      <MeetingSidebarLayout
        gotoStageId={gotoStageId}
        meetingType={meetingType}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        phaseTypes={phaseTypes}
        toggleSidebar={toggleSidebar}
        viewer={viewer}
      />
      <MeetingArea>
        <LayoutPusher isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed} />
        <MeetingContent>
          {/* For performance, the correct height of this component should load synchronously, otherwise the grouping grid will be off */}
          <MeetingAreaHeader>
            <NewMeetingPhaseHeading
              newMeeting={newMeeting}
              isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              swarm={swarm}
              gotoStageId={gotoStageId}
              team={team}
              camStreams={streams.cam}
            />
          </MeetingAreaHeader>
          <ErrorBoundary>{children}</ErrorBoundary>
        </MeetingContent>
      </MeetingArea>
      {!inSync && (
        <RejoinFacilitatorButton onClickHandler={() => gotoStageId(facilitatorStageId)} />
      )}
    </MeetingContainer>
  )
}

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(NewMeeting),
  graphql`
    fragment NewMeeting_viewer on User {
      featureFlags {
        video
      }
      ...MeetingSidebarLayout_viewer
      team(teamId: $teamId) {
        ...NewMeetingAvatarGroup_team
        id
        isMeetingSidebarCollapsed
        newMeeting {
          ...NewMeetingPhaseHeading_newMeeting
          id
          facilitatorStageId
          facilitatorUserId
          localStage {
            id
          }
          phases {
            stages {
              id
            }
          }
        }
      }
    }
  `
)
