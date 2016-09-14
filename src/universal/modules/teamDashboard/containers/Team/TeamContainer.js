import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const teamContainerSub = `
query {
  team @cached(id: $teamId, type: "Team") {
    id
    name
    meetingId
  },
  teamMembers(teamId: $teamId) @live {
    id
    picture
    preferredName
  }  
}`;


const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const teamContainer = cashay.query(teamContainerSub, {
    op: 'teamContainer',
    key: teamId,
    variables: {teamId}
  });
  const {team, teamMembers} = teamContainer.data;
  return {
    team,
    teamMembers
  };
};

const TeamContainer = (props) => {
  const {children, team, teamMembers} = props;
  const readyEnough = team.id && teamMembers.length > 0;
  if (!readyEnough) {
    return <LoadingView/>;
  }
  return (
    <Team
      team={team}
      teamMembers={teamMembers}
      children={children}
    />
  );
};

TeamContainer.propTypes = {
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
};

export default requireAuth(
  connect(mapStateToProps)(
    TeamContainer
  )
);
