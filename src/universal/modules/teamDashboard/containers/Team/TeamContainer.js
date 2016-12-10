import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

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
    <DashboardWrapper title="Team Dashboard">
      <Team
        team={team}
        teamMembers={teamMembers}
        children={children}
      />
    </DashboardWrapper>
  );
};

TeamContainer.propTypes = {
  children: PropTypes.any.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
};

export default
dragDropContext(HTML5Backend)(
  socketWithPresence(
    connect(mapStateToProps)(
      TeamContainer
    )
  )
);
