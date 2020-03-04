import {EditorState, SelectionState} from 'draft-js'

const getSelectionLink = (editorState: EditorState, selection: SelectionState) => {
  const startKey = selection.getStartKey()
  const endKey = selection.getEndKey()
  const currentContent = editorState.getCurrentContent()
  let currentKey = endKey
  let currentBlock = currentContent.getBlockForKey(endKey)
  let i = 0
  while (currentBlock) {
    i++
    const startChar = currentKey === startKey ? selection.getStartOffset() : 0
    const charList = currentBlock.getCharacterList()
    const endChar = currentKey === endKey ? selection.getEndOffset() : charList.size - 1
    const subset = charList.slice(startChar, endChar)
    const lastLinkChar = subset.findLast((value) => {
      return (
        (value &&
          value.getEntity() &&
          currentContent.getEntity(value.getEntity()).getType() === 'LINK') ||
        false
      )
    })
    if (lastLinkChar) {
      return currentContent.getEntity(lastLinkChar.getEntity()).getData().href as string
    }
    if (currentKey === startKey) return null
    currentKey = currentContent.getKeyBefore(currentKey)
    currentBlock = currentContent.getBlockForKey(currentKey)
    if (i >= 1000) {
      break
    }
  }
  return null
}

export default getSelectionLink
