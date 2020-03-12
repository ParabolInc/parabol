import {EditorState, Modifier} from 'draft-js'
import useEditorState from 'hooks/useEditorState'
import {useEffect} from 'react'
import completeEntity from 'utils/draftjs/completeEnitity'
import {ReplyMention, SetReplyMention} from '../components/ThreadedItem'

const useReplyEditorState = (
  replyMention: ReplyMention | undefined,
  setReplyMention: SetReplyMention | undefined
) => {
  const [editorState, setEditorState] = useEditorState()
  useEffect(() => {
    if (replyMention) {
      const {userId, preferredName} = replyMention
      setTimeout(() => {
        const es = EditorState.moveFocusToEnd(
          completeEntity(EditorState.createEmpty(), 'MENTION', {userId}, preferredName)
        )
        const nextContentState = Modifier.insertText(es.getCurrentContent(), es.getSelection(), ' ')
        const es2 = EditorState.moveFocusToEnd(EditorState.createWithContent(nextContentState))
        setEditorState(es2)
        setReplyMention!(null)
      })
    }
  }, [replyMention])
  return [editorState, setEditorState] as ReturnType<typeof useEditorState>
}

export default useReplyEditorState
