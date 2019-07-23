import {convertFromRaw, Modifier, SelectionState} from 'draft-js'

const MAX_BLOCKS = 5
const MAX_CHARS = 52
const ELLIPSIS = '…'

const truncateByBlock = (contentState) => {
  const blockArray = contentState.getBlocksAsArray()
  const lastBlock = blockArray[MAX_BLOCKS - 1]
  if (lastBlock) {
    const focusBlock = contentState.getLastBlock()
    if (focusBlock === lastBlock) return contentState
    const selectionState = new SelectionState({
      anchorOffset: lastBlock.getLength() + 1,
      focusOffset: focusBlock.getLength(),
      anchorKey: lastBlock.getKey(),
      focusKey: focusBlock.getKey(),
      isBackward: false,
      hasFocus: false
    })
    return Modifier.removeRange(contentState, selectionState, 'forward')
  }
  return contentState
}

// truncate on MAX_CHARS chars or MAX_BLOCKS line breaks
const truncateCard = (content, maxBlocks = MAX_BLOCKS, maxChars = MAX_CHARS) => {
  const contentState = truncateByBlock(convertFromRaw(JSON.parse(content)))
  const lastBlock = contentState.getLastBlock()
  let block = contentState.getFirstBlock()
  let curLength = 0
  for (let i = 0; i < maxBlocks; i++) {
    const key = block.getKey()
    const blockLen = block.getLength()
    curLength += blockLen
    if (curLength > maxChars) {
      const selection = new SelectionState({
        anchorOffset: Math.max(0, maxChars - curLength + blockLen - ELLIPSIS.length),
        focusOffset: lastBlock.getLength(),
        anchorKey: key,
        focusKey: lastBlock.getKey(),
        isBackward: false,
        hasFocus: false
      })
      const contentStateWithEntity = contentState.createEntity('TRUNCATED_ELLIPSIS', 'IMMUTABLE', {
        value: content
      })
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
      return Modifier.replaceText(contentState, selection, ELLIPSIS, null, entityKey)
    }
    block = contentState.getBlockAfter(key)
    if (!block) break
    // treat a linebreak as a character
    curLength++
  }
  return contentState
}

export default truncateCard
