import {EditorState} from 'draft-js'

const getFullLinkSelection = (editorState: EditorState) => {
  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const anchorOffset = selectionState.getAnchorOffset()
  const blockKey = selectionState.getAnchorKey()
  const block = contentState.getBlockForKey(blockKey)
  const entityKey = block.getEntityAt(anchorOffset - 1)
  const anchor = {
    offset: anchorOffset - 1,
    block
  }
  const curLeft = {...anchor}
  for (let i = 0; i < 1e5; i++) {
    if (curLeft.offset === 0) {
      curLeft.block = contentState.getBlockBefore(curLeft.block.getKey())!
      if (!curLeft.block) break
      curLeft.offset = curLeft.block.getLength()
    }
    const currentEntity = curLeft.block.getEntityAt(--curLeft.offset)
    if (currentEntity !== entityKey) break
    anchor.offset = curLeft.offset
    anchor.block = curLeft.block
  }

  const focus = {
    offset: anchorOffset,
    block
  }
  const curRight = {...focus}

  for (let i = 0; i < 1e5; i++) {
    if (curRight.offset === curRight.block.getLength()) {
      curRight.block = contentState.getBlockAfter(curRight.block.getKey())!
      if (!curRight.block) break
      curRight.offset = 0
    }
    // ++ suffix here because the focus goes up to but not including
    const currentEntity = curRight.block.getEntityAt(curRight.offset++)
    if (currentEntity !== entityKey) break
    focus.offset = curRight.offset
    focus.block = curRight.block
  }

  return selectionState.merge({
    anchorOffset: anchor.offset,
    anchorKey: anchor.block.getKey(),
    focusOffset: focus.offset,
    focusKey: focus.block.getKey()
  })
}

export default getFullLinkSelection
