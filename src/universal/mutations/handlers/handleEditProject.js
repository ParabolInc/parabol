import createProxyRecord from 'universal/utils/relay/createProxyRecord';

const handleEditProject = (payload, store) => {
  const projectId = payload.getLinkedRecord('project').getValue('id');
  const project = store.get(projectId);
  if (!project) return;
  const editor = payload.getLinkedRecord('editor');
  const userId = editor.getValue('id');
  const isEditing = payload.getValue('isEditing');

  const projectEditors = project.getLinkedRecords('editors') || [];
  const newProjectEditors = [];
  if (isEditing) {
    // handle multiple socket connections
    for (let ii = 0; ii < projectEditors.length; ii++) {
      const projectEditor = projectEditors[ii];
      if (projectEditor.getValue('userId') === userId) return;
      newProjectEditors.push(projectEditor);
    }
    const preferredName = editor.getValue('preferredName');
    const newProjectEditor = createProxyRecord(store, 'ProjectEditorDetails', {userId, preferredName});
    newProjectEditors.push(newProjectEditor);
  } else {
    for (let ii = 0; ii < projectEditors.length; ii++) {
      const projectEditor = projectEditors[ii];
      if (projectEditor.getValue('userId') !== userId) {
        newProjectEditors.push(projectEditor);
      }
    }
  }
  project.setLinkedRecords(newProjectEditors, 'editors');
};

export default handleEditProject;
