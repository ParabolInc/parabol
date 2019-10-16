import {ContentState, convertFromRaw, EditorState} from 'draft-js'
import editorDecorators from '../../components/TaskEditor/decorators'

const makeEditorState = (content: string | undefined | null, getEditorState: () => EditorState) => {
  const contentState = content
    ? convertFromRaw(JSON.parse(content))
    : ContentState.createFromText('')
  return EditorState.createWithContent(contentState, editorDecorators(getEditorState))
}

export default makeEditorState
