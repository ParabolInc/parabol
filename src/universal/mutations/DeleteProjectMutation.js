import {commitMutation} from 'react-relay';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';
import isTempId from 'universal/utils/relay/isTempId';

const mutation = graphql`
  mutation DeleteProjectMutation($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      project {
        id
      }
    }
  }
`;

const DeleteProjectMutation = (environment, projectId, teamId, onError, onCompleted) => {
  if (isTempId(projectId)) return undefined;
  const {viewerId} = environment;
  const updater = (store) => {
    handleRemoveProjects(projectId, store, viewerId);
  };
  return commitMutation(environment, {
    mutation,
    variables: {projectId},
    updater,
    optimisticUpdater: updater,
    onError,
    onCompleted
  });
};

export default DeleteProjectMutation;
