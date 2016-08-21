import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import resolveEditors from 'universal/subscriptions/computed/resolveEditors';
import TeamProjectCard from 'universal/modules/teamDashboard/components/TeamProjectCard/TeamProjectCard';

const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const mapStateToProps = (state, props) => {
  const {project, preferredName} = props;
  const taskId = project.id;
  const [teamId] = taskId.split('::');
  // debugger
  const tm = cashay.subscribe(teamMembersSubQuery, subscriber, {
    op: TEAM_MEMBERS,
    variables: {teamId},
  }).data.teamMembers;

  console.log('tm', tm);
  return {
    editors: cashay.computed('editingByTeam', [preferredName, taskId], resolveEditors),
    teamMembers: cashay.subscribe(teamMembersSubQuery, subscriber, {
      op: TEAM_MEMBERS,
      variables: {teamId},
    }).data.teamMembers
  };
};

const TeamProjectCardContainer = (props) => {
  const {project, editors, teamMembers, dispatch} = props;
  const {id, status} = project;
  const form = `${status}::${id}`;
  // console.log('teamMembers', teamMembers)
  return (
    <TeamProjectCard
      form={form}
      project={project}
      dispatch={dispatch}
      editors={editors}
      teamMembers={teamMembers}
    />
  );
};

TeamProjectCardContainer.propTypes = {
  dispatch: PropTypes.func,
  editors: PropTypes.array,
  project: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    teamMemberId: PropTypes.string,
    updatedAt: PropTypes.instanceOf(Date)
  }),
  teamMembers: PropTypes.array
};

export default connect(mapStateToProps)(TeamProjectCardContainer);
