import {EditorState} from 'draft-js'
import editorDecorators from '../../components/TaskEditor/decorators'

const remountDecorators = (
  getEditorState: () => EditorState,
  searchQuery: string | undefined | null
) => {
  return EditorState.set(getEditorState(), {
    decorator: editorDecorators(getEditorState, undefined, searchQuery)
  })
}

export default remountDecorators
