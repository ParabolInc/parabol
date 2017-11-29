import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeTasksByStatus from 'universal/utils/makeTasksByStatus';
import {USER_DASH} from 'universal/utils/constants';
import TaskColumns from 'universal/components/TaskColumns/TaskColumns';
import makeAllTasks from 'universal/utils/makeAllTasks';

// TODO this is a sign that cashay is missing something. how do we request a LIST of just tasks?
const userColumnsQuery = `
query {
  teams @cached(type: "[Team]") {
    id
    name
    tasks @live {
      id
      content
      createdAt
      createdBy
      integration {
        service
        nameWithOwner
        issueNumber
      }
      sortOrder
      status
      tags
      teamMemberId
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

const mutationHandlers = {
  updateTask(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedTask} = optimisticUpdates;
      if (updatedTask && updatedTask.hasOwnProperty('sortOrder')) {
        const {id, sortOrder, status} = updatedTask;
        const {teams} = currentResponse;
        for (let i = 0; i < teams.length; i++) {
          const team = teams[i];
          const fromTask = team.tasks.find((task) => task.id === id);
          if (fromTask) {
            if (sortOrder !== undefined) {
              fromTask.sortOrder = sortOrder;
            }
            if (status) {
              fromTask.status = status;
            }
            return currentResponse;
          }
        }
      }
    }
    return undefined;
  }
};

// memoized
const resolveUserTasks = (teams) => {
  if (teams !== resolveUserTasks.teams) {
    resolveUserTasks.teams = teams;
    const allTasks = makeAllTasks(teams);
    resolveUserTasks.cache = makeTasksByStatus(allTasks);
  }
  return resolveUserTasks.cache;
};

const mapStateToProps = (state) => {
  const {sub: userId} = state.auth.obj;
  const {teamFilterId} = state.userDashboard;
  const filterFn = teamFilterId ? (doc) => doc.id === teamFilterId : () => true;
  const queryKey = teamFilterId || '';
  const {teams} = cashay.query(userColumnsQuery, {
    op: 'userColumnsContainer',
    key: queryKey,
    mutationHandlers,
    resolveCached: {
      teams: () => () => true,
      team: (source) => source.teamMemberId.split('::')[1],
      teamMember: (source) => source.teamMemberId
    },
    resolveChannelKey: {
      tasks: (source) => `${userId}::${source.id}`
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    },
    filter: {
      teams: filterFn
    }
  }).data;
  return {
    tasks: resolveUserTasks(teams),
    queryKey,
    teams,
    userId: state.auth.obj.sub
  };
};

const UserColumnsContainer = (props) => {
  const {queryKey, tasks, teams, userId} = props;
  return (
    <TaskColumns queryKey={queryKey} tasks={tasks} area={USER_DASH} teams={teams} userId={userId} />
  );
};

UserColumnsContainer.propTypes = {
  tasks: PropTypes.object,
  queryKey: PropTypes.string,
  teams: PropTypes.array,
  userId: PropTypes.string
};

export default connect(mapStateToProps)(UserColumnsContainer);
