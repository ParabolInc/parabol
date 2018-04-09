import getInProxy from 'universal/utils/relay/getInProxy';

const handleEditReflection = (payload, store) => {
  const reflectionId = getInProxy(payload, 'reflection', 'id');
  const reflection = store.get(reflectionId);
  if (!reflection) return;
  const editorId = payload.getValue('editorId');
  const isEditing = payload.getValue('isEditing');
  const reflectionEditorIds = reflection.getValue('editorIds') || [];
  const nextEditorIds = isEditing ? reflectionEditorIds.concat(editorId) : reflectionEditorIds.filter((id) => id !== editorId);
  reflection.setValue(nextEditorIds, 'editorIds');
  reflection.setValue(nextEditorIds.length > 0, 'isEditing');
};

export default handleEditReflection;
