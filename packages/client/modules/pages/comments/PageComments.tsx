import type {Editor} from '@tiptap/core'
import {useEditorState} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {createPortal} from 'react-dom'
import {useFragment} from 'react-relay'
import type {PageComments_page$key} from '../../../__generated__/PageComments_page.graphql'
import {pageCommentKey} from '../../../tiptap/extensions/pageComment/PageComment'
import {PageCommentBubbleMenu} from './PageCommentBubbleMenu'
import {PageThreadRail} from './PageThreadRail'
import {PageThreadsButton} from './PageThreadsButton'

interface Props {
  editor: Editor
  isEditable: boolean
  pageRef: PageComments_page$key
  viewerId: string
  isPageOwner: boolean
  canFitRail: boolean
  headerSlot: HTMLElement | null
}

export const PageComments = (props: Props) => {
  const {editor, isEditable, pageRef, viewerId, isPageOwner, canFitRail, headerSlot} = props
  const page = useFragment(
    graphql`
      fragment PageComments_page on Page {
        id
        threads {
          id
          resolvedAt
          ...PageThreadCard_thread
        }
      }
    `,
    pageRef
  )
  const {id: pageId} = page
  const threads = page.threads ?? []
  const openThreads = threads.filter(({resolvedAt}) => !resolvedAt)
  const serializedOpenThreadIds = openThreads.map(({id}) => id).join()
  const {activeThreadId, hasDraft} = useEditorState({
    editor,
    selector: ({editor}) => {
      const pluginState = pageCommentKey.getState(editor.state)
      return {activeThreadId: pluginState?.activeThreadId ?? null, hasDraft: !!pluginState?.draft}
    }
  })
  useEffect(() => {
    editor.storage.pageComment.isCommentingEnabled = true
    return () => {
      editor.storage.pageComment.isCommentingEnabled = false
      if (!editor.isDestroyed) editor.commands.setOpenPageThreads([])
    }
  }, [editor])
  useEffect(() => {
    editor.commands.setOpenPageThreads(openThreads.map(({id}) => id))
  }, [editor, serializedOpenThreadIds])
  const threadProps = {editor, pageId, viewerId, isPageOwner, activeThreadId}
  return (
    <>
      {!isEditable && <PageCommentBubbleMenu editor={editor} />}
      {(hasDraft || openThreads.length > 0) && (
        <PageThreadRail
          {...threadProps}
          isRailLayout={canFitRail}
          openThreads={openThreads}
          hasDraft={hasDraft}
        />
      )}
      {headerSlot &&
        createPortal(<PageThreadsButton {...threadProps} threads={threads} />, headerSlot)}
    </>
  )
}
