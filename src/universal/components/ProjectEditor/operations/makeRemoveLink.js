import {EditorState, Modifier} from 'draft-js';

const makeRemoveLink = (blockKey, anchorOffset, focusOffset) => (editorState) => {
  const selection = editorState.getSelection();
  const selectionWithLink = selection.merge({
    anchorKey: blockKey,
    focusKey: blockKey,
    anchorOffset,
    focusOffset
  });
  const contentWithoutLink = Modifier.applyEntity(
    editorState.getCurrentContent(),
    selectionWithLink,
    null
  ).merge({
    selectionAfter: selection,
    selectionBefore: selection
  });
  return EditorState.push(editorState, contentWithoutLink, 'remove-link');
};

export default makeRemoveLink;