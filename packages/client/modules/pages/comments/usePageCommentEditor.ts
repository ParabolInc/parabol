import {useEffect, useState} from 'react'
import useEventCallback from '../../../hooks/useEventCallback'
import {useTipTapCommentEditor} from '../../../hooks/useTipTapCommentEditor'
import {useUpdatePageCommentMutation} from '../../../mutations/useUpdatePageCommentMutation'
import {isEqualWhenSerialized} from '../../../shared/isEqualWhenSerialized'

export const usePageCommentEditor = (commentId: string, content: string) => {
  const [isEditing, setIsEditing] = useState(false)
  const [updateComment, submitting] = useUpdatePageCommentMutation()
  const setEditing = (nextIsEditing: boolean) => {
    editor?.setEditable(nextIsEditing)
    setIsEditing(nextIsEditing)
    if (nextIsEditing) editor?.commands.focus('end')
  }
  const saveEdit = useEventCallback(() => {
    if (!editor || editor.isEmpty || submitting) return
    const nextContent = editor.getJSON()
    if (isEqualWhenSerialized(nextContent, JSON.parse(content))) return setEditing(false)
    updateComment({
      variables: {commentId, content: JSON.stringify(nextContent)},
      onCompleted: () => setEditing(false)
    })
  })
  const cancelEdit = useEventCallback(() => {
    editor?.commands.setContent(JSON.parse(content))
    setEditing(false)
  })
  const {editor} = useTipTapCommentEditor(content, {
    readOnly: true,
    onEnter: saveEdit,
    onEscape: cancelEdit
  })
  useEffect(() => {
    if (!editor || isEditing) return
    const nextContent = JSON.parse(content)
    if (!isEqualWhenSerialized(editor.getJSON(), nextContent)) {
      editor.commands.setContent(nextContent)
    }
  }, [content])
  return {editor, isEditing, startEditing: () => setEditing(true)}
}
