import {commitMutation} from 'react-relay';
import handleEditProject from 'universal/mutations/handlers/handleEditProject';
import getOptimisticProjectEditor from 'universal/utils/relay/getOptimisticProjectEditor';
import isTempId from 'universal/utils/relay/isTempId';

const mutation = graphql`
  mutation EditProjectMutation($projectId: ID!, $isEditing: Boolean!) {
    editProject(projectId: $projectId, isEditing: $isEditing) {
      isEditing
    }
  }
`;


const EditProjectMutation = (environment, projectId, isEditing, onCompleted, onError) => {
  if (isTempId(projectId)) return undefined;
  const {viewerId} = environment;
  const updater = (store) => {
    const payload = getOptimisticProjectEditor(store, viewerId, projectId, isEditing);
    handleEditProject(payload, store);
  };
  return commitMutation(environment, {
    mutation,
    variables: {projectId, isEditing},
    updater,
    optimisticUpdater: updater,
    onCompleted,
    onError
  });
};

export default EditProjectMutation;
