import type {Editor} from '@tiptap/core'
import {useEffect, useRef, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import EditCommentingMutation from '../mutations/EditCommentingMutation'
import useAtmosphere from './useAtmosphere'

export const useTipTapTypingStatus = (editor: Editor | null, discussionId: string) => {
  const [isTyping, setIsTyping] = useState<boolean | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const atmosphere = useAtmosphere()

  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => {
      if (editor.isEmpty) return
      setIsTyping(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setIsTyping(false), 5000)
    }

    const handleBlur = () => {
      setIsTyping(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    editor.on('update', handleUpdate)
    editor.on('focus', handleUpdate)
    editor.on('blur', handleBlur)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('focus', handleUpdate)
      editor.off('blur', handleBlur)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [editor])

  useEffect(() => {
    if (isTyping === null) return

    // Get the isAnonymousComment flag from the local store
    let isAnonymousComment = false
    commitLocalUpdate(atmosphere, (store) => {
      const discussion = store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
      if (discussion) {
        isAnonymousComment = !!discussion.getValue('isAnonymousComment')
      }
    })

    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: isTyping,
        discussionId,
        isAnonymous: isAnonymousComment
      },
      {}
    )
  }, [isTyping])

  return isTyping
}
