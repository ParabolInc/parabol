// @flow
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {meetingSidebarWidth} from 'universal/styles/meeting'
import styled from 'react-emotion'
import type {NewMeetingSidebar_viewer as Viewer} from './__generated__/NewMeetingSidebar_viewer.graphql'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import LogoBlock from 'universal/components/LogoBlock/LogoBlock'
import NewMeetingSidebarPhaseList from 'universal/components/NewMeetingSidebarPhaseList'
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import SidebarToggle from 'universal/components/SidebarToggle'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import {Link} from 'react-router-dom'

const SidebarHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative'
})

const StyledToggle = styled(SidebarToggle)({
  margin: '0 .75rem 0 1.5rem'
})

const SidebarParent = styled('div')({
  backgroundColor: ui.palette.white,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  maxWidth: meetingSidebarWidth,
  minWidth: meetingSidebarWidth,
  padding: '1.25rem 0 0'
})

const TeamDashboardLink = styled(Link)({
  color: ui.copyText,
  fontSize: appTheme.typography.s5,
  fontWeight: 600,
  lineHeight: '1.5',
  ':hover': {
    color: ui.palette.mid,
    cursor: 'pointer'
  }
})

type Props = {
  gotoStageId: (stageId: string) => void,
  meetingType: MeetingTypeEnum,
  toggleSidebar: () => void,
  viewer: Viewer
}

const NewMeetingSidebar = (props: Props) => {
  const {gotoStageId, meetingType, toggleSidebar, viewer} = props
  const {
    team: {teamId, teamName}
  } = viewer
  const meetingLabel = meetingTypeToLabel[meetingType]
  return (
    <SidebarParent>
      <SidebarHeader>
        <StyledToggle onClick={toggleSidebar} />
        <TeamDashboardLink to={`/team/${teamId}`}>{teamName}</TeamDashboardLink>
      </SidebarHeader>
      <MeetingSidebarLabelBlock>
        <LabelHeading>{`${meetingLabel} Meeting`}</LabelHeading>
      </MeetingSidebarLabelBlock>
      <ScrollableBlock>
        <NewMeetingSidebarPhaseList gotoStageId={gotoStageId} viewer={viewer} />
      </ScrollableBlock>
      <LogoBlock variant='primary' />
    </SidebarParent>
  )
}

export default createFragmentContainer(
  NewMeetingSidebar,
  graphql`
    fragment NewMeetingSidebar_viewer on User {
      ...NewMeetingSidebarPhaseList_viewer
      team(teamId: $teamId) {
        teamId: id
        teamName: name
      }
    }
  `
)
