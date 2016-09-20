import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import TeamArchive from 'universal/modules/teamDashboard/components/TeamArchive/TeamArchive';

const teamArchiveQuery = `
query {
  archivedProjects: getArchivedProjects(teamId: $teamId, first: $first) {
    id
    content
    status
    teamMemberId
    updatedAt
    cursor
    teamMember @cached(type: "TeamMember") {
      picture
      preferredName
    }
  }
}`;


const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const teamArchiveContainer = cashay.query(teamArchiveQuery, {
    op: 'teamArchiveContainer',
    key: teamId,
    variables: {teamId, first: 10},
    resolveCached: {
      teamMember: (source) => source.teamMemberId
    }
  });
  const {archivedProjects} = teamArchiveContainer.data;
  return {
    archivedProjects
  };
};

const TeamArchiveContainer = (props) => {
  const {archivedProjects, params: {teamId}} = props;
  return (
    <TeamArchive
      archivedProjects={archivedProjects}
      teamId={teamId}
    />
  );
};

TeamArchiveContainer.propTypes = {
  archivedProjects: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(TeamArchiveContainer);
