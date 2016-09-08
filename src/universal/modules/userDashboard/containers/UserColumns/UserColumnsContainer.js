import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {USER_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

const projectSubQuery = subscriptions.find(sub => sub.channel === PROJECTS).string;

// TODO this is a sign that cashay is missing something. how do we request a LIST of just projects?
const userColumnsQuery = `
query {
  teams @live {
    id
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

const resolveUserProjects = (teams) => {
  const allProjects = teams.map(team => team.projects).reduce((arr, projects) => {
    arr.push(...projects);
    return arr;
  },[]);
  return makeProjectsByStatus(allProjects, 'userSort');
};

const mapStateToProps = (state) => {
  const {sub: userId} = state.auth.obj;
  const teamsWithProjects = cashay.query(userColumnsQuery, {
    op: 'userColumnsContainer',
    resolveChannelKey: {
      projects: (source) => `${userId}::${source.id}`
    }
  }).data.teams;
  return {
    projects: resolveUserProjects(teamsWithProjects)
  };
};

const UserColumnsContainer = (props) => {
  const {projects} = props;
  return (
    <ProjectColumns projects={projects} area={USER_DASH}/>
  );
};

UserColumnsContainer.propTypes = {
  projects: PropTypes.object
};

export default connect(mapStateToProps)(UserColumnsContainer);
