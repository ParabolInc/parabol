// @flow
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Link} from 'react-router-dom'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'
import type {NewMeetingSidebar_viewer as Viewer} from './__generated__/NewMeetingSidebar_viewer.graphql'
// import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import LogoBlock from 'universal/components/LogoBlock/LogoBlock'
import NewMeetingSidebarPhaseList from 'universal/components/NewMeetingSidebarPhaseList'
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import SidebarToggle from 'universal/components/SidebarToggle'
// import makeHref from 'universal/utils/makeHref'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
// import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'

const SidebarHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative'
})

const ToggleBlock = styled('div')({
  margin: '0 .75rem 0 1.5rem',
  width: '1.5rem'
})

const SidebarParent = styled('div')({
  backgroundColor: ui.palette.white,
  boxShadow: ui.meetingChromeBoxShadow,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  maxWidth: ui.meetingSidebarWidth,
  minWidth: ui.meetingSidebarWidth,
  padding: '1.25rem 0 0'
})

const TeamDashboardLink = styled(Link)({
  color: ui.copyText,
  cursor: 'pointer',
  fontSize: appTheme.typography.s5,
  fontWeight: 600,
  lineHeight: '1.5'
})

type Props = {
  gotoStageId: (stageId: string) => void,
  hasToggle: boolean,
  meetingType: MeetingTypeEnum,
  toggleSidebar: () => void,
  viewer: Viewer
}

const NewMeetingSidebar = (props: Props) => {
  const {gotoStageId, hasToggle, meetingType, toggleSidebar, viewer} = props
  const {
    team: {teamId, teamName}
  } = viewer
  // const meetingSlug = meetingTypeToSlug[meetingType]
  const meetingLabel = meetingTypeToLabel[meetingType]
  // const relativeLink = `/${meetingSlug}/${teamId}`
  return (
    <SidebarParent>
      <SidebarHeader>
        <ToggleBlock>{hasToggle && <SidebarToggle onClick={toggleSidebar} />}</ToggleBlock>
        <TeamDashboardLink to={`/team/${teamId}`} title={`Go to the ${teamName} Team Dashboard`}>
          {teamName}
        </TeamDashboardLink>
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

// <CopyShortLink icon='link' label='Meeting Link' url={makeHref(relativeLink)} />

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
