import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import actionUIMark from 'universal/styles/theme/images/brand/mark-color.svg';
import ui from 'universal/styles/ui';
import makeHref from 'universal/utils/makeHref';
import styled from 'react-emotion';
import NewMeetingSidebarPhaseList from 'universal/components/NewMeetingSidebarPhaseList';

const BrandLogo = styled('img')({
  display: 'block',
  height: 'auto',
  width: '100%'
});

const BrandBlock = styled('div')({
  display: 'block',
  height: 'auto',
  left: '1rem',
  position: 'absolute',
  width: '1.9375rem'
});

const Nav = styled('nav')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  margin: '2rem 0 0',
  width: '100%'
});

const ShortUrl = styled('a')({
  ...textOverflow,
  color: appTheme.palette.dark10d,
  display: 'block',
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.sBase,
  paddingRight: ui.meetingSidebarGutter,
  textDecoration: 'none',
  '&:hover,:focus': {
    color: appTheme.palette.dark
  }
})

const SidebarHeader = styled('div')({
  paddingLeft: '3.75rem',
  position: 'relative'
});

const SidebarParent = styled('div')({
  backgroundColor: appTheme.palette.mid10l,
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem 0 0',
  maxWidth: ui.meetingSidebarWidth,
  minWidth: ui.meetingSidebarWidth
});

const TeamDashboardLink = styled(Link)({
  color: appTheme.palette.cool,
  cursor: 'pointer',
  fontFamily: appTheme.typography.serif,
  fontSize: appTheme.typography.s5,
  fontStyle: 'italic',
  fontWeight: 700,
  lineHeight: '1.5'
});

const NewMeetingSidebar = (props) => {
  const {
    localPhase,
    viewer
  } = props;
  const {team: {teamId, teamName}} = viewer;
  return (
    <SidebarParent>
      <SidebarHeader>
        <BrandBlock>
          <BrandLogo src={actionUIMark} />
        </BrandBlock>
        <TeamDashboardLink
          to={`/team/${teamId}`}
          title={`Go to the ${teamName} Team Dashboard`}
        >
          {teamName}
        </TeamDashboardLink>
        <ShortUrl href={`/retro/${teamId}`}>{makeHref(`/retro/${teamId}`)}</ShortUrl>
      </SidebarHeader>
      <Nav>
        <NewMeetingSidebarPhaseList localPhase={localPhase} viewer={viewer} />
      </Nav>
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
        newMeeting {
          id
          facilitatorId
          stages {
            isComplete
            isFacilitatorStage
            type
          }
        }
      }
    }
  `
);
