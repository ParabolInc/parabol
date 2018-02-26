import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import actionUIMark from 'universal/styles/theme/images/brand/mark-color.svg';
import ui from 'universal/styles/ui';
import {phaseArray} from 'universal/utils/constants';
import makeHref from 'universal/utils/makeHref';
import styled, {css} from 'react-emotion';
import NewMeetingSidebarPhaseList from 'universal/components/NewMeetingSidebarPhaseList';

const styles = {
  brandLogo: {
    display: 'block',
    height: 'auto',
    width: '100%'
  },

  navListItemMeetingMarker: {
    position: 'relative',

    '::after': {
      backgroundColor: appTheme.palette.warm,
      borderRadius: '100%',
      display: 'block',
      content: '""',
      height: '.75rem',
      marginTop: '-.375rem',
      position: 'absolute',
      right: '-.375rem',
      top: '50%',
      width: '.75rem'
    }
  },

  agendaListBlock: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  shortUrl: {
    ...textOverflow,
    color: appTheme.palette.dark10d,
    display: 'block',
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.sBase,
    paddingRight: ui.meetingSidebarGutter,
    textDecoration: 'none',

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  teamName: {
    color: appTheme.palette.cool,
    cursor: 'pointer',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: '1.5'
  }
};

const SidebarParent = styled('div')({
  backgroundColor: appTheme.palette.mid10l,
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem 0 0',
  maxWidth: ui.meetingSidebarWidth,
  minWidth: ui.meetingSidebarWidth
});

const SidebarHeader = styled('div')({
  paddingLeft: '3.75rem',
  position: 'relative'
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
          <img className={css(styles.brandLogo)} src={actionUIMark} />
        </BrandBlock>
        <Link
          className={css(styles.teamName)}
          to={`/team/${teamId}`}
          title={`Go to the ${teamName} Team Dashboard`}
        >
          {teamName}
        </Link>
        <a className={css(styles.shortUrl)} href={`/retro/${teamId}`}>{makeHref(`/retro/${teamId}`)}</a>
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
