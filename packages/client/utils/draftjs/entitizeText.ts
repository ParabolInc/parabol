import {ContentState, Modifier, SelectionState} from 'draft-js'
import {textTags} from '../constants'

const entitizeText = (contentState: ContentState, selectionState: SelectionState) => {
  const anchorOffset = selectionState.getAnchorOffset()
  const anchorKey = selectionState.getAnchorKey()
  const focusOffset = selectionState.getFocusOffset()
  const focusKey = selectionState.getFocusKey()
  let currentKey = anchorKey
  let cs = contentState
  while (currentKey) {
    const currentBlock = contentState.getBlockForKey(currentKey)
    const currentStart = anchorKey === currentKey ? anchorOffset : 0
    const currentEnd = focusKey === currentKey ? focusOffset : currentBlock.getLength()
    const blockText = currentBlock.getText().slice(currentStart, currentEnd)
    for (let i = 0; i < textTags.length; i++) {
      const tag = textTags[i]!
      const startIdx = blockText.indexOf(tag)
      if (startIdx !== -1) {
        const contentStateWithEntity = cs.createEntity('TAG', 'IMMUTABLE', {
          value: tag.slice(1)
        })
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        cs = Modifier.applyEntity(
          cs,
          selectionState.merge({
            anchorKey: currentKey,
            focusKey: currentKey,
            anchorOffset: startIdx,
            focusOffset: startIdx + tag.length
          }),
          entityKey
        )
      }
    }
    if (focusKey === currentKey) {
      return contentState === cs
        ? null
        : (cs.merge({
            selectionAfter: contentState.getSelectionAfter()
          }) as ContentState)
    }
    currentKey = contentState.getKeyAfter(currentKey)
  }
  return undefined
}

export default entitizeText
