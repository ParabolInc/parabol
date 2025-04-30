import type {Editor} from '@tiptap/core'
import {useEffect, useRef, useState} from 'react'
import EditCommentingMutation from '../mutations/EditCommentingMutation'
import useAtmosphere from './useAtmosphere'

export const useTipTapTypingStatus = (
  editor: Editor | null,
  discussionId: string,
  isAnonymous: boolean
) => {
  const [isTyping, setIsTyping] = useState<boolean | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const atmosphere = useAtmosphere()

  useEffect(() => {
    if (!editor || isAnonymous) return
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
  }, [editor, isAnonymous])

  useEffect(() => {
    if (isTyping === null) return
    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: isTyping,
        discussionId
      },
      {}
    )
  }, [isTyping])

  return isTyping
}
