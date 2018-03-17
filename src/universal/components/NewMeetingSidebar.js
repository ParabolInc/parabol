// @flow
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';
import type {NewMeetingSidebar_viewer as Viewer} from './__generated__/NewMeetingSidebar_viewer.graphql';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import LabelHeading from 'universal/components/LabelHeading/LabelHeading';
import LogoBlock from 'universal/components/LogoBlock/LogoBlock';
import NewMeetingSidebarPhaseList from 'universal/components/NewMeetingSidebarPhaseList';

const Nav = styled('nav')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
});

const SidebarHeader = styled('div')({
  paddingLeft: '3.75rem',
  position: 'relative'
});

const SidebarParent = styled('div')({
  backgroundColor: ui.palette.white,
  boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 10px, rgba(0, 0, 0, 0.23) 0px 3px 10px',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: ui.meetingSidebarWidth,
  minWidth: ui.meetingSidebarWidth,
  padding: '1.25rem 0 0'
});

const TeamDashboardLink = styled(Link)({
  color: ui.copyText,
  cursor: 'pointer',
  fontSize: appTheme.typography.s5,
  fontWeight: 600,
  lineHeight: '1.5'
});

const SidebarSubHeading = styled('div')({
  borderTop: `.0625rem solid ${ui.palette.light}`,
  margin: '1.25rem 0 0 3.75rem',
  padding: '1rem 0'
});

type Props = {
  viewer: Viewer
}

const NewMeetingSidebar = (props: Props) => {
  const {
    viewer
  } = props;
  const {team: {teamId, teamName}} = viewer;
  const relativeLink = `/retro/${teamId}`;
  return (
    <SidebarParent>
      <SidebarHeader>
        <TeamDashboardLink
          to={`/team/${teamId}`}
          title={`Go to the ${teamName} Team Dashboard`}
        >
          {teamName}
        </TeamDashboardLink>
        <CopyShortLink icon="link" label="Meeting Link" url={relativeLink} />
      </SidebarHeader>
      <SidebarSubHeading>
        <LabelHeading>{'Action Meeting'}</LabelHeading>
      </SidebarSubHeading>
      <Nav>
        <NewMeetingSidebarPhaseList viewer={viewer} />
      </Nav>
      <LogoBlock variant="primary" />
    </SidebarParent>
  );
};

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
);
