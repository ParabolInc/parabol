import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import TeamArchive from 'universal/modules/teamDashboard/components/TeamArchive/TeamArchive';

const teamArchiveQuery = `
query {
  archivedProjects(teamMemberId: $teamMemberId) @live {
    id
    content
    createdAt
    integration {
      service
      nameWithOwner
      issueNumber
    }
    status
    tags
    teamMemberId
    updatedAt
    team @cached(id: $teamId, type: "Team") {
      id
      name
    },
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
  }
}`;

const mapStateToProps = (state, props) => {
  const {match: {params: {teamId}}} = props;
  const userId = state.auth.obj.sub;
  const teamMemberId = `${userId}::${teamId}`;
  const teamArchiveContainer = cashay.query(teamArchiveQuery, {
    op: 'teamArchiveContainer',
    key: teamMemberId,
    variables: {teamMemberId},
    resolveCached: {
      team: (source) => source.teamMemberId.split('::')[1],
      teamMember: (source) => source.teamMemberId
    },
    sort: {
      archivedProjects: (a, b) => b.updatedAt - a.updatedAt
    }
  });
  const {archivedProjects} = teamArchiveContainer.data;
  return {
    archivedProjects,
    teamId,
    userId
  };
};

const TeamArchiveContainer = (props) => {
  const {archivedProjects, teamId, teamName, userId} = props;
  return (
    <TeamArchive
      archivedProjects={archivedProjects}
      teamId={teamId}
      teamName={teamName}
      userId={userId}
    />
  );
};

TeamArchiveContainer.propTypes = {
  archivedProjects: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired,
  teamName: PropTypes.string,
  userId: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(TeamArchiveContainer);
