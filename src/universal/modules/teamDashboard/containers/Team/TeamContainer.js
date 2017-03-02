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
    isPaid
    name
    meetingId
  },
  teamMembers(teamId: $teamId) @live {
    id
    picture
    preferredName
    presence @cached(type: "[Presence]") {
      userId
    }
  }
}`;


const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const {hasDashAlert} = state.dash;
  const teamContainer = cashay.query(teamContainerSub, {
    op: 'teamContainer',
    key: teamId,
    resolveCached: {presence: (source) => (doc) => source.id.startsWith(doc.userId)},
    variables: {teamId}
  });
  const {team, teamMembers} = teamContainer.data;
  return {
    hasDashAlert,
    team,
    teamMembers
  };
};

const TeamContainer = (props) => {
  const {children, hasDashAlert, team, teamMembers} = props;
  const readyEnough = team.id;
  return (
    <DashboardWrapper title="Team Dashboard">
      {readyEnough ?
        <Team
          children={children}
          hasDashAlert={hasDashAlert}
          team={team}
          teamMembers={teamMembers}
        /> :
        <LoadingView/>
      }
    </DashboardWrapper>
  );
};

TeamContainer.propTypes = {
  children: PropTypes.any.isRequired,
  hasDashAlert: PropTypes.bool,
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
