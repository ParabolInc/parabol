import {EditorState, Modifier} from 'draft-js';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';

const operationTypes = {
  'insert-emoji': {
    entityName: 'EMOJI',
    entityType: 'IMMUTABLE'
  },
  'insert-tag': {
    entityName: 'TAG',
    entityType: 'IMMUTABLE'
  },
  'insert-link': {
    entityName: 'LINK',
    entityType: 'MUTABLE'
  }
};

const getExpandedSelectionState = (editorState) => {
  const selectionState = editorState.getSelection();
  if (selectionState.isCollapsed()) {
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const {begin, end} = getWordAt(block.getText(), anchorOffset);
    return selectionState.merge({
      anchorOffset: begin,
      focusOffset: end
    });
  } else {
    return selectionState;
  }
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

const completeEntity = (editorState, operation, entityData, mention) => {
  const {entityName, entityType} = operationTypes[operation];
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState
    .createEntity(entityName, entityType, entityData);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const expandedSelectionState = getExpandedSelectionState(editorState);
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
  })
  return EditorState.push(editorState, finalContent, operation);
};

export default completeEntity;