import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import type {ReactNode} from 'react'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/TipTapEditor/TipTapEditor'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {PageCommentBubbleButton} from './comments/PageCommentBubbleButton'
import {StarterActions} from './StarterActions'
import {useEditablePage} from './useEditablePage'

interface Props {
  provider: HocuspocusProvider
  viewerRef: useTipTapPageEditor_viewer$key | null
  pageId: string
  renderComments?: (editor: Editor, isEditable: boolean) => ReactNode
}

export const PageEditor = (props: Props) => {
  const {provider, viewerRef, pageId, renderComments} = props
  const {editor} = useTipTapPageEditor(provider, {viewerRef, pageId})
  const isEditable = useEditablePage(provider, editor)
  if (!editor) return <div>No editor</div>
  return (
    <div className='flex w-full flex-col'>
      <TipTapEditor
        editor={editor}
        className={cn('page-editor relative flex w-full px-6 delay-300')}
        bubbleMenuActions={renderComments && <PageCommentBubbleButton editor={editor} />}
      />
      {isEditable && <StarterActions editor={editor} />}
      {renderComments?.(editor, isEditable)}
    </div>
  )
}
