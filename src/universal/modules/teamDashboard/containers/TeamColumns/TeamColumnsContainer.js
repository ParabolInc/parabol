import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM_MEMBERS, PROJECTS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {TEAM_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

const projectSubQuery = subscriptions.find(sub => sub.channel === PROJECTS).string;
const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const resolveTeamProjects = (myTeamMemberId) => {
  const [, teamId] = myTeamMemberId.split('::');
  const {teamMembers} = cashay.subscribe(teamMembersSubQuery, subscriber, {
    op: TEAM_MEMBERS,
    variables: {teamId},
    dep: 'teamColProjects'
  }).data;
  const projectSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const {id: teamMemberId} = teamMembers[i];
    projectSubs[i] = cashay.subscribe(projectSubQuery, subscriber, {
      op: PROJECTS,
      key: teamMemberId,
      variables: {teamMemberId},
      dep: 'teamColProjects'
    }).data.projects;
  }
  // debugger
  const allProjects = [].concat(...projectSubs);
  return makeProjectsByStatus(allProjects, 'teamSort');
};

const mapStateToProps = (state, props) => {
  const {myTeamMemberId} = props;
  return {
    projects: cashay.computed('teamColProjects', [myTeamMemberId], resolveTeamProjects)
  };
};

const TeamColumnsContainer = (props) => {
  const {myTeamMemberId, projects} = props;
  return (
    <ProjectColumns myTeamMemberId={myTeamMemberId} projects={projects} area={TEAM_DASH}/>
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object
};

export default connect(mapStateToProps)(TeamColumnsContainer);
