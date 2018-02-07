import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import getInProxy from 'universal/utils/relay/getInProxy';

const handleEditTask = (payload, store) => {
  const taskId = getInProxy(payload, 'task', 'id');
  const task = store.get(taskId);
  if (!task) return;
  const editor = payload.getLinkedRecord('editor');
  const userId = editor.getValue('id');
  const isEditing = payload.getValue('isEditing');

  const taskEditors = task.getLinkedRecords('editors') || [];
  const newTaskEditors = [];
  if (isEditing) {
    // handle multiple socket connections
    for (let ii = 0; ii < taskEditors.length; ii++) {
      const taskEditor = taskEditors[ii];
      if (taskEditor.getValue('userId') === userId) return;
      newTaskEditors.push(taskEditor);
    }
    const preferredName = editor.getValue('preferredName');
    const newTaskEditor = createProxyRecord(store, 'TaskEditorDetails', {userId, preferredName});
    newTaskEditors.push(newTaskEditor);
  } else {
    for (let ii = 0; ii < taskEditors.length; ii++) {
      const taskEditor = taskEditors[ii];
      if (taskEditor.getValue('userId') !== userId) {
        newTaskEditors.push(taskEditor);
      }
    }
  }
  task.setLinkedRecords(newTaskEditors, 'editors');
};

export default handleEditTask;
