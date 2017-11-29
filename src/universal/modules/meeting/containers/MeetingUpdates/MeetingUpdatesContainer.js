import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeTasksByStatus from 'universal/utils/makeTasksByStatus';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const meetingUpdatesQuery = `
query {
  tasks(teamMemberId: $teamMemberId) @live {
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
`;

const mutationHandlers = {
  updateTask(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedTask} = optimisticUpdates;
      if (updatedTask && updatedTask.hasOwnProperty('sortOrder')) {
        const {id, sortOrder, status} = updatedTask;
        const {tasks} = currentResponse;
        const fromTask = tasks.find((task) => task.id === id);
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
    return undefined;
  }
};

const mapStateToProps = (state, props) => {
  const {members, localPhaseItem} = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const teamMemberId = currentTeamMember && currentTeamMember.id;
  const memberTasks = cashay.query(meetingUpdatesQuery, {
    op: 'meetingUpdatesContainer',
    key: teamMemberId,
    mutationHandlers,
    variables: {teamMemberId},
    filter: {
      tasks: (task) => !task.tags.includes('private')
    },
    resolveCached: {
      teamMember: (source) => source.teamMemberId,
      team: (source) => source.teamMemberId.split('::')[1]
    }
  }).data.tasks;
  const tasks = makeTasksByStatus(memberTasks);
  return {
    tasks,
    queryKey: teamMemberId
  };
};

const MeetingUpdatesContainer = (props) => {
  if (!props.tasks) {
    return <LoadingView />;
  }
  return <MeetingUpdates {...props} />;
};

MeetingUpdatesContainer.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  tasks: PropTypes.object.isRequired,
  queryKey: PropTypes.string,
  team: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(MeetingUpdatesContainer);
