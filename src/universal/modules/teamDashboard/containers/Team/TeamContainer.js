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
    isLead
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
    teamMembers,
    myTeamMemberId: `${state.auth.obj.sub}::${teamId}`
  };
};

const TeamContainer = (props) => {
  const {
    children,
    hasDashAlert,
    team,
    teamMembers,
    myTeamMemberId
  } = props;
  const readyEnough = team.id;
  const myTeamMember = teamMembers.find((member) => member.id === myTeamMemberId);
  return (
    <DashboardWrapper title="Team Dashboard">
      {readyEnough ?
        <Team
          hasDashAlert={hasDashAlert}
          team={team}
          teamMembers={teamMembers}
          myTeamMember={myTeamMember}
        >
          {children}
        </Team>
          :
        <LoadingView />
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
