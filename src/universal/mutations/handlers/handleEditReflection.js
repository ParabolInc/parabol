const handleEditReflection = (payload, store) => {
  const phaseItemId = payload.getValue('phaseItemId')
  const isEditing = payload.getValue('isEditing')
  const editorId = payload.getValue('editorId')

  const phaseItem = store.get(phaseItemId)
  if (!phaseItem) return
  const editorIds = phaseItem.getValue('editorIds') || []
  const nextEditorIds = isEditing
    ? Array.from(new Set(editorIds.concat(editorId)))
    : editorIds.filter((id) => id !== editorId)
  phaseItem.setValue(nextEditorIds, 'editorIds')
}

export default handleEditReflection
