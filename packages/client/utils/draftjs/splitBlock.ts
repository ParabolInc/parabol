import {EditorState, Modifier} from 'draft-js'

const splitBlock = (editorState: EditorState) => {
  const contentState = Modifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection()
  )
  return EditorState.push(editorState, contentState, 'split-block')
}

export default splitBlock
