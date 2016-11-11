import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import TeamSettings from 'universal/modules/teamDashboard/components/TeamSettings/TeamSettings';
import {cashay} from 'cashay';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const teamSettingsQuery = `
query {
  team @cached(id: $teamId, type: "Team") {
    id
    name
  },
  teamMembers(teamId: $teamId) @live {
    id
    email
    isLead
    picture
    preferredName
  },
  invitations(teamId: $teamId) @live {
    id
    createdAt
    email
    tokenExpiration
  }
}`;

const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const {invitations, team, teamMembers} = cashay.query(teamSettingsQuery, {
    op: 'teamSettingsContainer',
    key: teamId,
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1,
      invitations: (a, b) => a.createdAt > b.createdAt ? 1 : -1
    },
    variables: {teamId}
  }).data;
  return {
    invitations,
    team,
    teamMembers,
    leaveTeamModal: state.teamSettings.leaveTeamModal,
    promoteTeamMemberModal: state.teamSettings.promoteTeamMemberModal,
    removeTeamMemberModal: state.teamSettings.removeTeamMemberModal,
    modalTeamMemberId: state.teamSettings.teamMemberId,
    modalPreferredName: state.teamSettings.preferredName,
    myTeamMemberId: `${state.auth.obj.sub}::${teamId}`
  };
};

const TeamSettingsContainer = (props) => {
  const {
    dispatch,
    invitations,
    leaveTeamModal,
    modalPreferredName,
    modalTeamMemberId,
    myTeamMemberId,
    promoteTeamMemberModal,
    removeTeamMemberModal,
    team,
    teamMembers
  } = props;
  const myTeamMember = teamMembers.find((member) => member.id === myTeamMemberId);
  if (!myTeamMember) {
    return <LoadingView/>;
  }
  return (
    <TeamSettings
      dispatch={dispatch}
      invitations={invitations}
      leaveTeamModal={leaveTeamModal}
      myTeamMember={myTeamMember}
      modalTeamMemberId={modalTeamMemberId}
      modalPreferredName={modalPreferredName}
      promoteTeamMemberModal={promoteTeamMemberModal}
      removeTeamMemberModal={removeTeamMemberModal}
      team={team}
      teamMembers={teamMembers}
    />
  );
};

TeamSettingsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  leaveTeamModal: PropTypes.bool.isRequired,
  modalPreferredName: PropTypes.string,
  modalTeamMemberId: PropTypes.string,
  myTeamMemberId: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
  promoteTeamMemberModal: PropTypes.bool.isRequired,
  removeTeamMemberModal: PropTypes.bool.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(TeamSettingsContainer);
