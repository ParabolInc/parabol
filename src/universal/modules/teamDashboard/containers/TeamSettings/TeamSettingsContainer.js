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
  integrations(teamMemberId: $teamMemberId) @live {
    id
    service
    userId
  }
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
  const {invitations, integrations, orgApprovals, team, teamMembers} = cashay.query(teamSettingsQuery, {
    op: 'teamSettingsContainer',
    key: teamId,
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1,
      invitations: (a, b) => a.createdAt > b.createdAt ? 1 : -1,
      orgApprovals: (a, b) => a.email > b.email ? 1 : -1
    },
    resolveChannelKey: {
      integrations: () => teamMemberId
    },
    variables: {teamId, teamMemberId}
  }).data;
  return {
    integrations,
    invitations,
    orgApprovals,
    team,
    teamMembers,
    myTeamMemberId: teamMemberId
  };
};

const TeamSettingsContainer = (props) => {
  const {
    dispatch,
    orgApprovals,
    integrations,
    invitations,
    myTeamMemberId,
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
      integrations={integrations}
      invitations={invitations}
      orgApprovals={orgApprovals}
      myTeamMember={myTeamMember}
      team={team}
      teamMembers={teamMembers}
    />
  );
};

TeamSettingsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  myTeamMemberId: PropTypes.string.isRequired,
  orgApprovals: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(TeamSettingsContainer);
