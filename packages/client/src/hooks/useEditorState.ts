import useRefState from './useRefState'
import {EditorState} from 'draft-js'
import makeEditorState from '../utils/draftjs/makeEditorState'
import {useEffect} from 'react'

const useEditorState = (content?: string | null | undefined) => {
  const [editorStateRef, setEditorState] = useRefState<EditorState>(() =>
    makeEditorState(content, () => editorStateRef.current)
  )
  useEffect(() => {
    setEditorState(makeEditorState(content, () => editorStateRef.current))
  }, [content, editorStateRef, setEditorState])
  return [editorStateRef.current, setEditorState] as [
    EditorState,
    (editorState: EditorState) => void
  ]
}

export default useEditorState
