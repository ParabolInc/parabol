import React, {Component, PropTypes} from 'react';
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

@connect(mapStateToProps)
export default class TeamSettingsContainer extends Component {
  static propTypes = {
    invitations: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
    teamMembers: PropTypes.array.isRequired
  };


  render() {
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
    } = this.props;
    const myTeamMember = teamMembers.find((member) => member.id === myTeamMemberId);
    if (!myTeamMember) {
      return <LoadingView/>
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
  }
};
