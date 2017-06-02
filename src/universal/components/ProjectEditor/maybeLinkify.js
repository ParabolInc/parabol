import {EditorState, Modifier} from 'draft-js';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import getWordAt from './getWordAt';

const linkify = linkifyIt();
linkify.tlds(tlds);

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

}

const makeAddLink = (block, anchorOffset, focusOffset, url) => (editorState) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState
    .createEntity('LINK', 'MUTABLE', {url});
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const selectionState = editorState.getSelection();
  const linkSelectionState = selectionState.merge({
    anchorKey: block,
    focusKey: block,
    anchorOffset,
    focusOffset
  });
  const contentWithUrl = Modifier.applyEntity(
    contentState,
    linkSelectionState,
    entityKey
  ).merge({
    selectionAfter: selectionState,
    selectionBefore: selectionState
  });
  return {
    editorState: EditorState.push(editorState, contentWithUrl, 'apply-link'),
    undoLinkify: makeRemoveLink(block, anchorOffset, focusOffset)
  };
};

const maybeLinkify = (editorState) => {
  const selection = editorState.getSelection();
  const currentContent = editorState.getCurrentContent();
  const anchorKey = selection.getAnchorKey();
  const anchorOffset = selection.getAnchorOffset() - 1;
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  const blockText = currentBlock.getText();
  const {begin, end, word} = getWordAt(blockText, anchorOffset, true);
  const entity = currentBlock.getEntityAt(anchorOffset);
  if (word && !entity) {
    const links = linkify.match(word);
    if (links) {
      const {url} = links[0];
      return makeAddLink(currentBlock.getKey(), begin, end, url);
    }
  }
  return undefined;
};

export default maybeLinkify;