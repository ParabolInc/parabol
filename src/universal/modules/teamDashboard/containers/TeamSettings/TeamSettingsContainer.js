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
    variables: {teamId}
  }).data;
  return {
    invitations,
    team,
    teamMembers,
    removeTeamMemberModal: state.teamSettings.removeTeamMemberModal
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
    const {dispatch, invitations,removeTeamMemberModal, team, teamMembers} = this.props;
    if (teamMembers.length === 0) {
      return <LoadingView/>
    }
    return (
      <TeamSettings
        dispatch={dispatch}
        invitations={invitations}
        removeTeamMemberModal={removeTeamMemberModal}
        team={team}
        teamMembers={teamMembers}
      />
    );
  }
};
