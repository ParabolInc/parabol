import type {Editor} from '@tiptap/core'
import {useState} from 'react'
import type {PageThreadCard_thread$key} from '../../../__generated__/PageThreadCard_thread.graphql'
import {cn} from '../../../ui/cn'
import {PageThreadCard} from './PageThreadCard'
import {getPageThreadAnchors} from './usePageThreadLayout'

type Thread = {id: string; resolvedAt: string | null | undefined} & PageThreadCard_thread$key

interface Props {
  editor: Editor
  pageId: string
  viewerId: string
  isPageOwner: boolean
  threads: readonly Thread[]
  activeThreadId: string | null
}

export const PageThreadList = (props: Props) => {
  const {editor, pageId, viewerId, isPageOwner, threads, activeThreadId} = props
  const [isShowingResolved, setIsShowingResolved] = useState(false)
  const openThreads = threads.filter(({resolvedAt}) => !resolvedAt)
  const resolvedThreads = threads.filter(({resolvedAt}) => resolvedAt)
  const visibleThreads = isShowingResolved ? resolvedThreads : openThreads
  const tabs = [
    {label: `Open · ${openThreads.length}`, isResolvedTab: false},
    {label: `Resolved · ${resolvedThreads.length}`, isResolvedTab: true}
  ]
  const goToThread = (threadId: string, anchor: Element | undefined) => {
    if (isShowingResolved || threadId === activeThreadId) return
    editor.commands.setActivePageThread(threadId)
    anchor?.scrollIntoView({block: 'center', behavior: 'smooth'})
  }
  return (
    <>
      <div role='tablist' className='flex gap-1 border-hairline border-b p-2'>
        {tabs.map(({label, isResolvedTab}) => (
          <button
            key={label}
            role='tab'
            aria-selected={isResolvedTab === isShowingResolved}
            onClick={() => setIsShowingResolved(isResolvedTab)}
            className={cn(
              'cursor-pointer rounded-md px-2 py-1 font-semibold text-sm hover:bg-surface-hover',
              isResolvedTab === isShowingResolved
                ? 'bg-surface-hover text-fg-primary'
                : 'text-fg-secondary'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className='flex flex-col gap-2 overflow-y-auto p-2'>
        {visibleThreads.length === 0 && (
          <div className='px-4 py-6 text-center text-fg-muted text-sm'>
            {isShowingResolved
              ? 'Resolved threads show up here'
              : 'Select some text to comment on it'}
          </div>
        )}
        {visibleThreads.map((thread) => {
          const [anchor] = getPageThreadAnchors(editor, thread.id)
          return (
            <PageThreadCard
              key={thread.id}
              threadRef={thread}
              pageId={pageId}
              viewerId={viewerId}
              isPageOwner={isPageOwner}
              isActive={!isShowingResolved && thread.id === activeThreadId}
              showQuote
              note={anchor ? undefined : 'The text this thread is about was deleted'}
              onActivate={() => goToThread(thread.id, anchor)}
            />
          )
        })}
      </div>
    </>
  )
}
