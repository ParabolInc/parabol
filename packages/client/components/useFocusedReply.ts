import {RefObject, useEffect, useRef} from 'react'

const useFocusedReply = (
  ownerId: string,
  replyingToCommentId: string | null,
  commentRef: RefObject<HTMLDivElement>,
  replyEditorRef: RefObject<HTMLTextAreaElement>
) => {
  const wasReplyingRef = useRef(false)
  const isReplying = replyingToCommentId === ownerId
  useEffect(() => {
    if (isReplying && !wasReplyingRef.current) {
      commentRef.current?.scrollIntoView({behavior: 'smooth'})
      replyEditorRef.current?.focus()
    }
  }, [isReplying])
}
export default useFocusedReply
