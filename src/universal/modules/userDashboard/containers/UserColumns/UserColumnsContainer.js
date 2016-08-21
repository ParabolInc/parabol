import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {USER_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

const projectSubString = subscriptions.find(sub => sub.channel === PROJECTS).string;

const resolveUserProjects = (userId, tms) => {
  const projectSubs = [];
  for (let i = 0; i < tms.length; i++) {
    const teamId = tms[i];
    const teamMemberId = `${userId}::${teamId}`;
    projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
      op: 'projectSub',
      key: teamMemberId,
      variables: {teamMemberId},
      dependency: 'projectSubs'
    }).data.projects;
  }
  const allProjects = [].concat(...projectSubs);
  return makeProjectsByStatus(allProjects, 'userSort');
};

const mapStateToProps = (state) => {
  const {sub: userId, tms} = state.auth.obj;
  return {
    projects: cashay.computed('projectSubs', [userId, tms], resolveUserProjects)
  };
};

const UserColumnsContainer = (props) => {
  const {projects} = props;
  return (
    <ProjectColumns projects={projects} area={USER_DASH}/>
  );
};

UserColumnsContainer.propTypes = {
  projects: PropTypes.array
};

export default connect(mapStateToProps)(UserColumnsContainer);
