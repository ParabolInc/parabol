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
  updateProject(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedProject} = optimisticUpdates;
      if (updatedProject && updatedProject.hasOwnProperty('teamSort')) {
        const {id, teamSort, status} = updatedProject;
        const {teamMembers} = currentResponse;
        for (let i = 0; i < teamMembers.length; i++) {
          const teamMember = teamMembers[i];
          const fromProject = teamMember.projects.find((action) => action.id === id);
          if (fromProject) {
            if (teamSort !== undefined) {
              fromProject.teamSort = teamSort;
            }
            if (status) {
              fromProject.status = status;
            }
            // no need to sort since the resolveTeamProjects function will do that next
            return currentResponse;
          }
        }
      }
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
  return (
    <ProjectColumns
      myTeamMemberId={myTeamMemberId}
      projects={projects}
      queryKey={teamId}
      area={TEAM_DASH}
    />
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object,
  querykey: PropTypes.string
};

export default connect(mapStateToProps)(TeamColumnsContainer);
