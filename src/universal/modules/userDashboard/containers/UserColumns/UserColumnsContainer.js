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
  teams @live {
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
  const {teams} = cashay.query(userColumnsQuery, {
    op: 'userColumnsContainer',
    resolveChannelKey: {
      projects: (source) => `${userId}::${source.id}`
    },
    sort: {
      teams: (a,b) => a.name > b.name
    }
  }).data;
  return {
    projects: resolveUserProjects(teams),
    teams,
    userId: state.auth.obj.sub
  };
};

const UserColumnsContainer = (props) => {
  const {projects, teams, userId} = props;
  return (
    <ProjectColumns projects={projects} area={USER_DASH} teams={teams} userId={userId}/>
  );
};

UserColumnsContainer.propTypes = {
  projects: PropTypes.object
};

export default connect(mapStateToProps)(UserColumnsContainer);
