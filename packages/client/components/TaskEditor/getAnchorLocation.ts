import {EditorState} from 'draft-js'

const getAnchorLocation = (editorState: EditorState) => {
  const selection = editorState.getSelection()
  const currentContent = editorState.getCurrentContent()
  const anchorKey = selection.getAnchorKey()
  return {
    anchorOffset: selection.getAnchorOffset(),
    block: currentContent.getBlockForKey(anchorKey)
  }
}

export default getAnchorLocation
