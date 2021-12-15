import {Modifier, SelectionState} from 'draft-js'

const addTagToTask = (contentState, tag) => {
  const value = tag.slice(1)
  const lastBlock = contentState.getLastBlock()
  const selectionState = new SelectionState({
    anchorKey: lastBlock.getKey(),
    anchorOffset: lastBlock.getLength(),
    focusKey: lastBlock.getKey(),
    focusOffset: lastBlock.getLength(),
    isBackward: false,
    hasFocus: false
  })
  const contentStateWithNewBlock = Modifier.splitBlock(contentState, selectionState)
  const newBlock = contentStateWithNewBlock.getLastBlock()
  const lastSelection = selectionState.merge({
    anchorKey: newBlock.getKey(),
    focusKey: newBlock.getKey(),
    anchorOffset: 0,
    focusOffset: 0
  })

  const contentStateWithEntity = contentStateWithNewBlock.createEntity('TAG', 'IMMUTABLE', {value})
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

  return Modifier.replaceText(contentStateWithEntity, lastSelection, tag, undefined, entityKey)
}

export default addTagToTask
