import {EditorState, Modifier} from 'draft-js';

const makeRemoveLink = (block, anchorOffset, focusOffset) => (editorState) => {
  const selection = editorState.getSelection();
  const selectionWithLink = selection.merge({
    anchorKey: block,
    focusKey: block,
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