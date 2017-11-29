import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeTasksByStatus from 'universal/utils/makeTasksByStatus';
import {TEAM_DASH} from 'universal/utils/constants';
import TaskColumns from 'universal/components/TaskColumns/TaskColumns';
import makeAllTasks from 'universal/utils/makeAllTasks';

const teamColumnsSubQuery = `
query {
  teamMembers (teamId: $teamId) @live {
    id
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
const resolveTeamTasks = (teamMembers) => {
  if (teamMembers !== resolveTeamTasks.teamMembers) {
    resolveTeamTasks.teamMembers = teamMembers;
    const allTasks = makeAllTasks(teamMembers);
    resolveTeamTasks.cache = makeTasksByStatus(allTasks);
  }
  return resolveTeamTasks.cache;
};

const mutationHandlers = {
  updateTask(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedTask} = optimisticUpdates;
      if (updatedTask && updatedTask.hasOwnProperty('sortOrder')) {
        const {id, sortOrder, status} = updatedTask;
        const {teamMembers} = currentResponse;
        for (let i = 0; i < teamMembers.length; i++) {
          const teamMember = teamMembers[i];
          const fromTask = teamMember.tasks.find((task) => task.id === id);
          if (fromTask) {
            if (sortOrder !== undefined) {
              fromTask.sortOrder = sortOrder;
            }
            if (status) {
              fromTask.status = status;
            }
            // no need to sort since the resolveTeamTasks function will do that next
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
  const tasks = resolveTeamTasks(teamMembers);
  const userId = state.auth.obj.sub;
  return {
    tasks,
    myTeamMemberId: `${userId}::${teamId}`,
    queryKey: key,
    userId
  };
};


const TeamColumnsContainer = (props) => {
  const {myTeamMemberId, tasks, queryKey, userId} = props;
  return (
    <TaskColumns
      myTeamMemberId={myTeamMemberId}
      tasks={tasks}
      queryKey={queryKey}
      area={TEAM_DASH}
      userId={userId}
    />
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  tasks: PropTypes.object,
  queryKey: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(TeamColumnsContainer);
