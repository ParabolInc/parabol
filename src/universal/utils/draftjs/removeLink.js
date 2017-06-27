import {EditorState, Modifier} from 'draft-js';
import getFullLinkSelection from 'universal/utils/draftjs/getFullLinkSelection';

const removeLink = (editorState) => {
  const selectionState = editorState.getSelection();
  const linkSelection = selectionState.isCollapsed() ? getFullLinkSelection(editorState) : selectionState;
  const contentWithoutLink = Modifier.applyEntity(
    editorState.getCurrentContent(),
    linkSelection,
    null
  ).merge({
    selectionAfter: selectionState,
    selectionBefore: selectionState
  });
  return EditorState.push(editorState, contentWithoutLink, 'apply-entity');
};

export default removeLink;
