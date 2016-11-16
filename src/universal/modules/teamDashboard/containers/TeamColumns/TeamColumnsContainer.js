import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {TEAM_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import makeAllProjects from 'universal/utils/makeAllProjects';
import getNewSortOrder from 'universal/utils/getNewSortOrder';

const teamColumnsSubQuery = `
query {
  teamMembers (teamId: $teamId) @live {
    id
    picture
    preferredName,
    projects @live {
      content
      id
      status
      teamMemberId
      updatedAt
      userSort
      teamSort
    }
  }
}
`;

// memoized
const resolveTeamProjects = (teamMembers) => {
  if (teamMembers !== resolveTeamProjects.teamMembers) {
    resolveTeamProjects.teamMembers = teamMembers;
    const allProjects = makeAllProjects(teamMembers);
    resolveTeamProjects.cache = makeProjectsByStatus(allProjects, 'teamSort');
  }
  return resolveTeamProjects.cache;
};

const mutationHandlers = {
  updateProject(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables && optimisticVariables.hasOwnProperty('teamSort')) {
      const {id, teamSort, status} = optimisticVariables;
      const fromAction = currentResponse.projects.find((action) => action.id === id);
      fromAction.teamSort = teamSort;
      fromAction.status = status;
      // no need to sort since the resolveTeamProjects function will do that next
      return currentResponse;
    }
    return undefined;
  }
};

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const teamColumnsSub = cashay.query(teamColumnsSubQuery, {
    op: 'teamColumnsContainer',
    key: teamId,
    mutationHandlers,
    variables: {teamId},
  });
  const {teamMembers} = teamColumnsSub.data;
  const projects = resolveTeamProjects(teamMembers);
  return {
    projects,
    myTeamMemberId: `${state.auth.obj.sub}::${teamId}`,
    teamId,
    teamMembers
  };
};


const TeamColumnsContainer = (props) => {
  const {myTeamMemberId, projects, teamId} = props;
  const dragProject = (sourceProps, targetProps) => {
    const {id, teamSort: sourceTeamSort, status: sourceStatus} = sourceProps;
    const {project: {teamSort: targetTeamSort, status: targetStatus}} = targetProps;
    const safeSortOrder = sourceStatus === targetStatus ? sourceTeamSort : -Infinity;
    // TODO handle case where both are equal
    const updatedTeamSort = getNewSortOrder(projects[targetStatus], safeSortOrder, targetTeamSort, true, 'teamSort');
    const updatedProject = {id, teamSort: updatedTeamSort};
    if (sourceStatus !== targetStatus) {
      updatedProject.status = targetStatus;
    }
    const options = {
      ops: {
        teamColumnsContainer: teamId,
      },
      variables: {updatedProject}
    };
    // mutative!
    sourceProps.teamSort = updatedTeamSort;
    cashay.mutate('updateProject', options);
  };
  return (
    <ProjectColumns dragProject={dragProject} myTeamMemberId={myTeamMemberId} projects={projects} queryKey={teamId} area={TEAM_DASH}/>
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object,
  querykey: PropTypes.string
};

export default connect(mapStateToProps)(TeamColumnsContainer);
