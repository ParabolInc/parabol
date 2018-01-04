import {commitMutation} from 'react-relay';
import handleEditProject from 'universal/mutations/handlers/handleEditProject';
import getOptimisticProjectEditor from 'universal/utils/relay/getOptimisticProjectEditor';
import isTempId from 'universal/utils/relay/isTempId';

graphql`
  fragment EditProjectMutation_project on EditProjectPayload {
    project {
      id
    }
    editor {
      id
      preferredName
    }
    isEditing
  }
`;

const mutation = graphql`
  mutation EditProjectMutation($projectId: ID!, $isEditing: Boolean!) {
    editProject(projectId: $projectId, isEditing: $isEditing) {
      ...EditProjectMutation_project @relay(mask: false)      
    }
  }
`;

export const editProjectProjectUpdater = (payload, store) => {
  handleEditProject(payload, store);
};

const EditProjectMutation = (environment, projectId, isEditing, onCompleted, onError) => {
  if (isTempId(projectId)) return undefined;
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {projectId, isEditing},
    updater: (store) => {
      const payload = store.getRootField('editProject');
      editProjectProjectUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const payload = getOptimisticProjectEditor(store, viewerId, projectId, isEditing);
      handleEditProject(payload, store);
    },
    onCompleted,
    onError
  });
};

export default EditProjectMutation;
