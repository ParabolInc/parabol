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

const mutationHandlers = {
  updateProject(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      const projectId = optimisticVariables.updatedProject.id;
      const projectIdx = currentResponse.archivedProjects.findIndex(p => p.id === projectId);
      if (projectIdx !== -1) {
        currentResponse.splice(projectIdx, 1);
        return currentResponse;
      }
    }
    return undefined;
  }
};

const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const teamArchiveContainer = cashay.query(teamArchiveQuery, {
    op: 'teamArchiveContainer',
    key: teamId,
    variables: {teamId, first: 10},
    mutationHandlers,
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
