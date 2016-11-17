import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {USER_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import makeAllProjects from 'universal/utils/makeAllProjects';

// TODO this is a sign that cashay is missing something. how do we request a LIST of just projects?
const userColumnsQuery = `
query {
  teams @cached(type: "[Team]") {
    id
    name
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
const resolveUserProjects = (teams) => {
  if (teams !== resolveUserProjects.teams) {
    resolveUserProjects.teams = teams;
    const allProjects = makeAllProjects(teams);
    resolveUserProjects.cache = makeProjectsByStatus(allProjects, 'userSort');
  }
  return resolveUserProjects.cache;
};

const mapStateToProps = (state) => {
  const {sub: userId} = state.auth.obj;
  const {teamFilterId} = state.userDashboard;
  const filterFn = teamFilterId ? (doc) => doc.id === teamFilterId : () => true;
  const queryKey = teamFilterId || '';
  const {teams} = cashay.query(userColumnsQuery, {
    op: 'userColumnsContainer',
    key: queryKey,
    resolveCached: {
      teams: () => () => true
    },
    resolveChannelKey: {
      projects: (source) => `${userId}::${source.id}`
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    },
    filter: {
      teams: filterFn
    }
  }).data;
  return {
    projects: resolveUserProjects(teams),
    queryKey,
    teams,
    userId: state.auth.obj.sub
  };
};

const UserColumnsContainer = (props) => {
  const {queryKey, projects, teams, userId} = props;
  return (
    <ProjectColumns queryKey={queryKey} projects={projects} area={USER_DASH} teams={teams} userId={userId} zIndex="200" />
  );
};

UserColumnsContainer.propTypes = {
  projects: PropTypes.object,
  queryKey: PropTypes.string,
  teams: PropTypes.array,
  userId: PropTypes.string
};

export default connect(mapStateToProps)(UserColumnsContainer);
