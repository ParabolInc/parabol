import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CreateTaskMutation($newTask: TaskInput!, $area: AreaEnum) {
    createTask(newTask: $newTask, area: $area) {
      task {
        id
        agendaId
        content
        createdAt
        createdBy
        sortOrder
        status
        tags
        teamId
        teamMemberId
        updatedAt
        userId
      }
    }
  }
`;

const CreateTaskMutation = (environment, newTask, area, onError, onCompleted) => {
  // const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {area, newTask},
    // updater: (store) => {
    // },
    // optimisticUpdater: (store) => {
    // TODO add the team to the sidebar when we move teams to relay
    // },
    onError,
    onCompleted
  });
};

export default CreateTaskMutation;
