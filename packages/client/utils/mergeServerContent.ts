import {ContentState, EditorState} from 'draft-js'

const getBestFitSelection = (newContentState: ContentState, oldKey: string, oldOffset: number) => {
  const contentBlock = newContentState.getBlockForKey(oldKey) || newContentState.getFirstBlock()
  const key = contentBlock.getKey()
  const blockLength = contentBlock.getText().length
  const offset = key === oldKey ? Math.min(blockLength, oldOffset) : blockLength
  return {key, offset}
}

const getMergedSelection = (oldEditorState: EditorState, newContentState: ContentState) => {
  const oldSelection = oldEditorState.getSelection()
  const oldStartKey = oldSelection.getStartKey()
  const oldStartOffset = oldSelection.getStartOffset()
  const {offset: startOffset, key: startKey} = getBestFitSelection(
    newContentState,
    oldStartKey,
    oldStartOffset
  )
  if (oldSelection.isCollapsed()) {
    return oldSelection.merge({
      anchorOffset: startOffset,
      focusOffset: startOffset,
      anchorKey: startKey,
      focusKey: startKey
    })
  }
  const {offset: endOffset, key: endKey} = getBestFitSelection(
    newContentState,
    oldSelection.getEndKey(),
    oldSelection.getEndOffset()
  )
  return oldSelection.merge({
    anchorOffset: startOffset,
    focusOffset: endOffset,
    anchorKey: startKey,
    focusKey: endKey
  })
}

const mergeServerContent = (oldEditorState: EditorState, newContentState: ContentState) => {
  // unless it's being simultaneously edited, don't bother setting selection
  if (!oldEditorState.getSelection().getHasFocus()) {
    return newContentState
  }
  return newContentState.merge({
    selectionAfter: getMergedSelection(oldEditorState, newContentState)
  }) as ContentState
}

export default mergeServerContent
