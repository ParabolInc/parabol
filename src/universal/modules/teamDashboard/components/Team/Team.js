import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import {
  DashContent,
  DashHeader,
  DashLayout,
  DashMain,
  DashSidebar
} from 'universal/components/Dashboard';

const faIconStyle = {
  fontSize: '14px',
  lineHeight: 'inherit',
  marginRight: '.25rem'
};

const linkStyle = {
  display: 'inline-block',
  height: '15px',
  lineHeight: '15px',
  marginRight: '1.5rem',
  textDecoration: 'none'
};

const Team = (props) => {
  const {dispatch, user} = props;
  const activeTeamId = props.urlParams.id;
  const goToLink = (e) => {
    e.preventDefault();
    console.log('TODO: Go to link');
  };

  return (
    <DashLayout title="Team Dashboard">
      <DashSidebar
        activeTeamId={activeTeamId}
        dispatch={dispatch}
        user={user}
      />
      <DashMain>
        <DashHeader title="Team Name">
          <a
            href="#"
            onClick={goToLink}
            style={linkStyle}
            title="Meeting Lobby"
          >
            <FontAwesome name="arrow-circle-right" style={faIconStyle} /> Meeting Lobby
          </a>
          <a
            href="#"
            onClick={goToLink}
            style={linkStyle}
            title="Team Settings"
          >
            <FontAwesome name="cog" style={faIconStyle} /> Team Settings
          </a>
        </DashHeader>
        <DashContent>
          Team Outcomes
        </DashContent>
      </DashMain>
    </DashLayout>
  );
};

Team.propTypes = {
  dispatch: PropTypes.func.isRequired,
  urlParams: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
    memberships: PropTypes.array
  })
};

export default Team;
