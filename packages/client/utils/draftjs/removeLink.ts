import {ContentState, EditorState, Modifier} from 'draft-js'
import getFullLinkSelection from './getFullLinkSelection'

const removeLink = (editorState: EditorState) => {
  const selectionState = editorState.getSelection()
  const linkSelection = selectionState.isCollapsed()
    ? getFullLinkSelection(editorState)
    : selectionState
  const contentWithoutLink = Modifier.applyEntity(
    editorState.getCurrentContent(),
    linkSelection,
    null
  ).merge({
    selectionAfter: selectionState,
    selectionBefore: selectionState
  }) as ContentState
  return EditorState.push(editorState, contentWithoutLink, 'apply-entity')
}

export default removeLink
