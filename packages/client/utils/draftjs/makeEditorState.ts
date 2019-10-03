import {convertFromRaw, EditorState} from 'draft-js'
import editorDecorators from '../../components/TaskEditor/decorators'

const makeEditorState = (content: string, getEditorState: () => EditorState) => {
  const contentState = convertFromRaw(JSON.parse(content))
  return EditorState.createWithContent(contentState, editorDecorators(getEditorState))
}

export default makeEditorState
