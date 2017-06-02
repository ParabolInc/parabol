import {EditorState, Modifier} from 'draft-js';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import getWordAtCaret from 'universal/components/ProjectEditor/getWordAtCaret';

const linkify = linkifyIt();
linkify.tlds(tlds);

const maybeLinkify = (editorState) => {
  const {start, end, word, entity} = getWordAtCaret(editorState);
  if (word && !entity) {
    const links = linkify.match(word);
    if (links) {
      const {url} = links[0];
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const contentStateWithEntity = contentState
        .createEntity('LINK', 'MUTABLE', {url});
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      const urlTextSelection = selectionState.merge({
        anchorOffset: start,
        focusOffset: end
      });

      // I should be able to use applyEntity here, but i get "Cannot read property 'getEntity' of undefined"
      // TODO: rewrite when I understand draftjs more
      const contentWithUrl = Modifier.replaceText(
        contentState,
        urlTextSelection,
        word,
        null,
        entityKey
      );
      const newEditorState = EditorState.push(editorState, contentWithUrl, 'apply-url');
      const newSelection = newEditorState.getSelection();

      const correctedSelection = newSelection.merge({
        anchorOffset: newSelection.getFocusOffset()
      });
      return EditorState.forceSelection(newEditorState, correctedSelection);
    }
  }
  return editorState
};

export default maybeLinkify;