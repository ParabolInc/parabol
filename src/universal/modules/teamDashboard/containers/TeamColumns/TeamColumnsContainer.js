import PropTypes from 'prop-types';
import React from 'react';
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
    projects @live {
      id
      content
      createdAt
      createdBy
      status
      tags
      teamMemberId
      updatedAt
      sortOrder
      updatedAt
      team @cached(type: "Team") {
        id
        name
      }
      teamMember @cached(type: "TeamMember") {
        id
        picture
        preferredName
      }
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
          const fromProject = teamMember.projects.find((project) => project.id === id);
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
    resolveCached: {
      teamMember: (source) => source.teamMemberId,
      team: (source) => source.teamMemberId.split('::')[1]
    },
    variables: {teamId}
  }).data;
  const projects = resolveTeamProjects(teamMembers);
  const userId = state.auth.obj.sub;
  return {
    projects,
    myTeamMemberId: `${userId}::${teamId}`,
    queryKey: key,
    userId
  };
};


const TeamColumnsContainer = (props) => {
  const {myTeamMemberId, projects, queryKey, userId} = props;
  return (
    <ProjectColumns
      myTeamMemberId={myTeamMemberId}
      projects={projects}
      queryKey={queryKey}
      area={TEAM_DASH}
      userId={userId}
    />
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object,
  queryKey: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(TeamColumnsContainer);
