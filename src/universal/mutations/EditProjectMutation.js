import {commitMutation} from 'react-relay';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const mutation = graphql`
  mutation EditProjectMutation($projectId: ID!, $editing: Boolean!) {
    editProject(projectId: $projectId, editing: $editing) {
      editor {
        editing
        projectId
        user {
          userId: id
          preferredName
        }
      }
    }
  }
`;

const handleEditing = (store, editing, projectId, editorDetails) => {
  const project = store.get(projectId);
  if (!project) return;
  const projectEditors = project.getLinkedRecords('editors');
  const newProjectEditors = [];
  const incomingUserId = editorDetails.getValue('userId');
  if (editing) {
    // handle multiple socket connections
    for (let ii = 0; ii < projectEditors.length; ii++) {
      const projectEditor = projectEditors[ii];
      if (projectEditor.getValue('userId') === incomingUserId) return;
      newProjectEditors.push(projectEditor);
    }
    newProjectEditors.push(editorDetails);
  } else {
    for (let ii = 0; ii < projectEditors.length; ii++) {
      const projectEditor = projectEditors[ii];
      if (projectEditor.getValue('userId') !== incomingUserId) {
        newProjectEditors.push(projectEditor);
      }
    }
  }
  project.setLinkedRecords(newProjectEditors, 'editors');
};

export const handleEditingFromPayload = (store, editorPayload) => {
  const editing = editorPayload.getValue('editing');
  const projectId = editorPayload.getValue('projectId');
  const editorDetails = editorPayload.getLinkedRecord('user');

  // manual alias: https://github.com/facebook/relay/issues/2196
  editorDetails.setValue(editorDetails.getValue('id'), 'userId');
  handleEditing(store, editing, projectId, editorDetails);
};

const EditProjectMutation = (environment, projectId, editing, onCompleted, onError) => {
  const {userId} = environment;
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
  return commitMutation(environment, {
    mutation,
    variables: {projectId, editing},
    updater: (store) => {
      const payload = store.getRootField('editProject').getLinkedRecord('editor');
      handleEditingFromPayload(store, payload);
    },
    optimisticUpdater: (store) => {
      // TODO fix when we move users to relay
      const user = store.get(userId);
      const preferredName = user ? user.getValue('preferredName') : 'you';
      const optimisticDetails = {
        userId,
        preferredName
      };
      const editorDetails = createProxyRecord(store, 'ProjectEditorDetails', optimisticDetails);
      handleEditing(store, editing, projectId, editorDetails);
    },
    onCompleted,
    onError
  });
};

export default EditProjectMutation;
