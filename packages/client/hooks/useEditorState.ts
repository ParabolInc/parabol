import useRefState from './useRefState'
import {EditorState} from 'draft-js'
import makeEditorState from '../utils/draftjs/makeEditorState'
import {useRef, useEffect} from 'react'
import * as Sentry from '@sentry/browser'

const useEditorState = (content?: string | null | undefined) => {
  const [editorStateRef, setEditorState] = useRefState<EditorState>(() =>
    makeEditorState(content, () => editorStateRef.current)
  )
  const isErrorSentToSentryRef = useRef<boolean>(false)
  const lastFiredRef = useRef<Date | null>(null)
  useEffect(() => {
    if (!content) return
    const parsedContent = JSON.parse(content)
    if (!parsedContent.blocks) return
    const parsedBlock = parsedContent.blocks[0]
    const {text, key} = parsedBlock
    const editorStateContent = editorStateRef.current.getCurrentContent()
    const editorStateBlock = editorStateContent.getLastBlock()
    const editorStateKey = editorStateBlock.getKey()
    const editorStateText = editorStateContent.getPlainText()

    const now = new Date()
    const diff = lastFiredRef.current && now.getTime() - lastFiredRef.current.getTime()

    // prevent nasty infinite loop bug: https://sentry.io/organizations/parabol/issues/1641789488
    const minTime = 20
    if (diff && diff < minTime) {
      if (!isErrorSentToSentryRef.current) {
        const error = {
          parsedContent,
          editorStateText,
          editorStateKey,
          timeSinceLastRender: diff
        }
        Sentry.captureException(new Error(`useEditorState fired in last ${minTime}ms. ${error}`))
        isErrorSentToSentryRef.current = true
      }
      return
    }

    if (editorStateText === text && editorStateKey === key) return
    lastFiredRef.current = now
    setEditorState(makeEditorState(content, () => editorStateRef.current))
  }, [content, editorStateRef, setEditorState])

  return [editorStateRef.current, setEditorState] as [
    EditorState,
    (editorState: EditorState) => void
  ]
}

export default useEditorState
