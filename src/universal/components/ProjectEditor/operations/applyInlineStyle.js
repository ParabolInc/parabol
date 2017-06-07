import {EditorState, Modifier} from 'draft-js';


const applyInlineStyle = (blockKey, anchorOffset, focusOffset, style, newText) => (editorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const styleSelectionState = selectionState.merge({
    anchorKey: blockKey,
    focusKey: blockKey,
    anchorOffset,
    focusOffset
  });
  const contentWithUrl = Modifier.replaceText(
    contentState,
    styleSelectionState,
    newText,
    style
  ).merge({
    selectionAfter: selectionState,
    selectionBefore: selectionState
  });
  return EditorState.push(editorState, contentWithUrl, 'change-inline-style');
};