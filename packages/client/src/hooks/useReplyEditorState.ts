import {ContentState, EditorState, Modifier} from 'draft-js'
import {useEffect} from 'react'
import useEditorState from '~/hooks/useEditorState'
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
        const empty = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
        const cs = empty.getCurrentContent().createEntity('MENTION', 'IMMUTABLE', {userId})
        const nextContentState = Modifier.insertText(
          cs,
          empty.getSelection(),
          preferredName,
          undefined,
          cs.getLastCreatedEntityKey()
        )
        setEditorState(
          EditorState.moveFocusToEnd(EditorState.push(empty, nextContentState, 'apply-entity'))
        )
        setReplyMention!(null)
      })
    }
  }, [replyMention])
  return [editorState, setEditorState] as ReturnType<typeof useEditorState>
}

export default useReplyEditorState
