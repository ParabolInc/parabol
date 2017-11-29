import {adjustArchive} from 'universal/mutations/UpdateTaskMutation';

const subscription = graphql`
  subscription TaskUpdatedSubscription($teamId: ID!) {
    taskUpdated(teamId: $teamId) {
      task {
        id
        content
        createdAt
        integration {
          service
          nameWithOwner
          issueNumber
        }
        status
        tags
        teamMemberId
        updatedAt
        teamMember {
          id
          picture
          preferredName
        }
      }
    }
  }
`;

const TaskUpdatedSubscription = (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const task = store.getRootField('taskUpdated').getLinkedRecord('task');
      adjustArchive(store, viewerId, task, teamId);
    }
  };
};

export default TaskUpdatedSubscription;
