import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {TEAM_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import makeAllProjects from 'universal/utils/makeAllProjects';

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
      sortOrder
    }
  }
}
`;

// memoized
const resolveTeamProjects = (teamMembers) => {
  if (teamMembers !== resolveTeamProjects.teamMembers) {
    resolveTeamProjects.teamMembers = teamMembers;
    const allProjects = makeAllProjects(teamMembers);
    resolveTeamProjects.cache = makeProjectsByStatus(allProjects);
  }
  return resolveTeamProjects.cache;
};

const mutationHandlers = {
  updateProject(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedProject} = optimisticUpdates;
      if (updatedProject && updatedProject.hasOwnProperty('sortOrder')) {
        const {id, sortOrder, status} = updatedProject;
        const {teamMembers} = currentResponse;
        for (let i = 0; i < teamMembers.length; i++) {
          const teamMember = teamMembers[i];
          const fromProject = teamMember.projects.find((action) => action.id === id);
          if (fromProject) {
            if (sortOrder !== undefined) {
              fromProject.sortOrder = sortOrder;
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
  const {teamMemberFilterId} = state.teamDashboard;
  const key = teamMemberFilterId || teamId;
  const filterFn = teamMemberFilterId ? (doc) => doc.id === teamMemberFilterId : () => true;
  const {teamMembers} = cashay.query(teamColumnsSubQuery, {
    op: 'teamColumnsContainer',
    filter: {
      teamMembers: filterFn
    },
    key,
    mutationHandlers,
    variables: {teamId},
  }).data;
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
  teamId: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(TeamColumnsContainer);
