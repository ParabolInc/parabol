import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, PRESENCE} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {USER_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import resolveEditingByTeam from 'universal/subscriptions/computed/resolveEditingByTeam';
import resolveEditors from 'universal/subscriptions/computed/resolveEditors';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);
// const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

// const resolveMembersWithPresence = (userId, teamId) => {
//   const membersWithPresence = [];
//   const {presence} = cashay.subscribe(presenceSubscription.string, presenceSubscriber, {
//     variables: {teamId},
//     op: 'socketWithPresence',
//     dependency: 'membersWithPresence'
//   }).data;
// const {teamMembers} = cashay.subscribe(teamMembersSubString, subscriber, {op: 'memberSub', variables}).data;

// for (let i = 0; i < teamMembers.length; i++) {
//   const teamMember = teamMembers[i];
//   membersWithPresence[i] = {
//     ...teamMember,
//   }
//   const teamMemberId = `${userId}::${teamId}`;
//   projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
//     op: 'projectSub',
//     key: teamMemberId,
//     variables: {teamMemberId},
//     dependency: 'projectSubs'
//   }).data.projects;
// }
// const allProjects = [].concat(...projectSubs);
// return makeProjectsByStatus(allProjects, 'userSort');
// }
// ;

const mapStateToProps = (state, props) => {
  const taskId = props.project.id;
  return {
    editors: cashay.computed('editingByTeam', [taskId], resolveEditors)
  };
};

const TeamProjectCardContainer = (props) => {
  const {area, project, username} = props;
  const {content, id, status} = project;
  const form = `${status}::${id}`
  return (
    <TeamProjectCard
      form={form}
      project={project}
      dispatch={dispatch}
      editors={editors}
      teamId={teamId}
      teamMemberId={teamMemberId}
      teamMembers={teamMembers}
      updatedAt={updatedAt}
    />
  )
};

TeamProjectCardContainer.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(TeamProjectCardContainer);
