import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'
import EditCommentingMutation from '../mutations/EditCommentingMutation'
import useAtmosphere from './useAtmosphere'
import useIsEditing from './useIsEditing'

export const useTipTapTypingStatus = (
  editor: Editor | null,
  discussionId: string,
  isAnonymous: boolean
) => {
  const atmosphere = useAtmosphere()
  const isTyping = useIsEditing({editor})

  useEffect(() => {
    if (isTyping && !isAnonymous) {
      EditCommentingMutation(
        atmosphere,
        {
          isCommenting: true,
          discussionId
        },
        {}
      )
      return () => {
        EditCommentingMutation(
          atmosphere,
          {
            isCommenting: false,
            discussionId
          },
          {}
        )
      }
    }
    return undefined
  }, [isTyping, isAnonymous, discussionId, atmosphere])

  return isTyping
}
