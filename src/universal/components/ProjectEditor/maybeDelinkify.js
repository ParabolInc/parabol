import {EditorState, Modifier} from 'draft-js';

const maybeDelinkify = (editorState, onChange) => {
  // see if there is a link just before us
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
  const entityEnd = selectionState.getStartOffset() - 1;
  const entityKey = currentBlock.getEntityAt(entityEnd);
  if (entityKey && contentState.getEntity(entityKey).getType() === 'LINK') {
    let i;
    for (i = entityEnd - 1; i >= 0; i--) {
      if (currentBlock.getEntityAt(i) !== entityKey) {
        break;
      }
    }
    const selectedLinkState = selectionState.merge({
      anchorOffset: i + 1,
      focusOffset: entityEnd + 1
    });
    const newContentState = Modifier.applyEntity(
      contentState,
      selectedLinkState,
      null
    );
    const newEditorState = EditorState.push(editorState, newContentState, 'remove-link');
    const newSelection = newEditorState.getSelection();

    const correctedSelection = newSelection.merge({
      anchorOffset: newSelection.getFocusOffset()
    });
    const correctedEditorState = EditorState.forceSelection(newEditorState, correctedSelection);
    onChange(correctedEditorState);
    return 'handled';
  }
  return 'not-handled';
};

export default maybeDelinkify;