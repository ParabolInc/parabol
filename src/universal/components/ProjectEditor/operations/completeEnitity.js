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
  }
};


const completeEntity = (editorState, operation, entityData, mention) => {
  const {entityName, entityType} = operationTypes[operation];
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const contentStateWithEntity = contentState
    .createEntity(entityName, entityType, entityData);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const {block, anchorOffset} = getAnchorLocation(editorState);
  const {begin, end} = getWordAt(block.getText(), anchorOffset);
  const emojiTextSelection = selectionState.merge({
    anchorOffset: begin,
    focusOffset: end
  });
  const contentWithTag = Modifier.replaceText(
    contentState,
    emojiTextSelection,
    mention,
    null,
    entityKey
  );
  return EditorState.push(editorState, contentWithTag, operation);
};

export default completeEntity;