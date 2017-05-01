import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import TeamSettings from 'universal/modules/teamDashboard/components/TeamSettings/TeamSettings';
import {cashay} from 'cashay';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const teamSettingsQuery = `
query {
  team @cached(id: $teamId, type: "Team") {
    id
    name
    orgId
    meetingPhase
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
    email
    tokenExpiration
    updatedAt
  },
  orgApprovals(teamId: $teamId) @live {
    id
    email
  }
}`;

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  const teamMemberId = `${state.auth.obj.sub}::${teamId}`;
  const {invitations, orgApprovals, team, teamMembers} = cashay.query(teamSettingsQuery, {
    op: 'teamSettingsContainer',
    key: teamId,
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1,
      invitations: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
      orgApprovals: (a, b) => a.email > b.email ? 1 : -1
    },
    variables: {teamId, teamMemberId}
  }).data;
  return {
    invitations,
    orgApprovals,
    team,
    teamMembers,
    myTeamMemberId: teamMemberId,
    beta: state.auth.obj.bet
  };
};

const TeamSettingsContainer = (props) => {
  const {
    dispatch,
    orgApprovals,
    invitations,
    myTeamMemberId,
    beta,
    team,
    teamMembers
  } = props;
  const myTeamMember = teamMembers.find((member) => member.id === myTeamMemberId);
  if (!myTeamMember) {
    return <LoadingView />;
  }
  return (
    <TeamSettings
      dispatch={dispatch}
      invitations={invitations}
      orgApprovals={orgApprovals}
      myTeamMember={myTeamMember}
      beta={beta}
      team={team}
      teamMembers={teamMembers}
    />
  );
};

TeamSettingsContainer.propTypes = {
  beta: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  myTeamMemberId: PropTypes.string.isRequired,
  orgApprovals: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(TeamSettingsContainer);
