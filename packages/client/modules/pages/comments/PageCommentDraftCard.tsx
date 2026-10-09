import type {Editor} from '@tiptap/core'
import {useAddPageCommentMutation} from '../../../mutations/useAddPageCommentMutation'
import {getPageCommentDraftAnchor} from '../../../tiptap/extensions/pageComment/PageComment'
import {PageCommentComposer} from './PageCommentComposer'

interface Props {
  editor: Editor
  pageId: string
}

export const PageCommentDraftCard = (props: Props) => {
  const {editor, pageId} = props
  const [addComment, submitting] = useAddPageCommentMutation()
  const submitThread = (content: string, onSubmitted: () => void) => {
    const anchor = getPageCommentDraftAnchor(editor)
    if (!anchor) return
    addComment({
      variables: {pageId, content, anchor},
      onCompleted: (response) => {
        onSubmitted()
        editor
          .chain()
          .discardPageCommentDraft()
          .setActivePageThread(response.addPageComment.thread.id)
          .run()
      }
    })
  }
  return (
    <div className='rounded-lg border border-hairline-strong bg-surface-card p-3 shadow-card-1'>
      <PageCommentComposer
        placeholder='Add a comment'
        submitLabel='Comment'
        submitting={submitting}
        autoFocus
        onSubmit={submitThread}
        onCancel={() => editor.commands.discardPageCommentDraft()}
      />
    </div>
  )
}
