import {EditorState, Modifier} from 'draft-js';
import getAnchorLocation from 'universal/components/TaskEditor/getAnchorLocation';
import getWordAt from 'universal/components/TaskEditor/getWordAt';

const operationTypes = {
  EMOJI: {
    editorChangeType: 'apply-entity',
    entityType: 'IMMUTABLE'
  },
  TAG: {
    editorChangeType: 'apply-entity',
    entityType: 'IMMUTABLE'
  },
  LINK: {
    editorChangeType: 'apply-entity',
    entityType: 'MUTABLE'
  },
  MENTION: {
    editorChangeType: 'apply-entity',
    entityType: 'SEGMENTED'
  }
};

const getExpandedSelectionState = (editorState) => {
  const selectionState = editorState.getSelection();
  if (selectionState.isCollapsed()) {
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const {begin, end} = getWordAt(block.getText(), anchorOffset - 1);
    return selectionState.merge({
      anchorOffset: begin,
      focusOffset: end
    });
  }
  return selectionState;
};

const makeContentWithEntity = (contentState, selectionState, mention, entityKey) => {
  if (!mention) {
    // anchorKey && focusKey should be different here (used for EditorLinkChanger)
    return Modifier.applyEntity(
      contentState,
      selectionState,
      entityKey
    );
  }
  return Modifier.replaceText(
    contentState,
    selectionState,
    mention,
    null,
    entityKey
  );
};

export const autoCompleteEmoji = (editorState, emoji) => {
  const contentState = editorState.getCurrentContent();
  const expandedSelectionState = getExpandedSelectionState(editorState);

  const nextContentState = Modifier.replaceText(
    contentState,
    expandedSelectionState,
    emoji
  );
  const endKey = nextContentState.getSelectionAfter().getEndKey();
  const endOffset = nextContentState.getSelectionAfter().getEndOffset();
  const collapsedSelectionState = expandedSelectionState.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset
  });
  const finalContent = nextContentState.merge({
    selectionAfter: collapsedSelectionState
    // selectionBefore: collapsedSelectionState,
  });
  return EditorState.push(editorState, finalContent, 'remove-characters');
};

const completeEntity = (editorState, entityName, entityData, mention, options = {}) => {
  const {keepSelection} = options;
  const {editorChangeType, entityType} = operationTypes[entityName];
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState
    .createEntity(entityName, entityType, entityData);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const expandedSelectionState = keepSelection ? editorState.getSelection() : getExpandedSelectionState(editorState);
  const contentWithEntity = makeContentWithEntity(contentState, expandedSelectionState, mention, entityKey);
  const endKey = contentWithEntity.getSelectionAfter().getEndKey();
  const endOffset = contentWithEntity.getSelectionAfter().getEndOffset();
  const collapsedSelectionState = expandedSelectionState.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset
  });
  const finalContent = contentWithEntity.merge({
    selectionAfter: collapsedSelectionState
    // selectionBefore: collapsedSelectionState,
  });
  return EditorState.push(editorState, finalContent, editorChangeType);
};

export default completeEntity;
