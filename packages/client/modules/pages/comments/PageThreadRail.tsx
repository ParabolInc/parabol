import type {Editor} from '@tiptap/core'
import {useEffect, useRef} from 'react'
import type {PageThreadCard_thread$key} from '../../../__generated__/PageThreadCard_thread.graphql'
import {cn} from '../../../ui/cn'
import {PageCommentDraftCard} from './PageCommentDraftCard'
import {PageThreadCard} from './PageThreadCard'
import {DRAFT_CARD_ID, usePageThreadLayout} from './usePageThreadLayout'

interface Props {
  editor: Editor
  pageId: string
  viewerId: string
  isPageOwner: boolean
  isRailLayout: boolean
  openThreads: readonly ({id: string} & PageThreadCard_thread$key)[]
  activeThreadId: string | null
  hasDraft: boolean
}

export const PageThreadRail = (props: Props) => {
  const {editor, pageId, viewerId, isPageOwner, isRailLayout, openThreads, activeThreadId} = props
  const {hasDraft} = props
  const layerRef = useRef<HTMLDivElement>(null)
  const cardIds = [...(hasDraft ? [DRAFT_CARD_ID] : []), ...openThreads.map(({id}) => id)]
  const {tops, setCardElement} = usePageThreadLayout({
    editor,
    layerRef,
    cardIds,
    activeCardId: hasDraft ? DRAFT_CARD_ID : activeThreadId,
    isRailLayout
  })
  // a card that just got its first position must not slide in from the top of the page
  const positionedCardIdsRef = useRef<string[]>([])
  useEffect(() => {
    positionedCardIdsRef.current = Object.keys(tops)
  })
  return (
    <div
      ref={layerRef}
      data-page-thread-rail={isRailLayout ? '' : undefined}
      className={cn(
        'absolute top-0 print:hidden',
        isRailLayout ? 'left-full ml-2 w-72' : 'pointer-events-none inset-x-6 z-5'
      )}
    >
      {cardIds.map((cardId) => {
        const thread = openThreads.find(({id}) => id === cardId)
        const top = tops[cardId]
        return (
          <div
            key={cardId}
            ref={(cardElement) => setCardElement(cardId, cardElement)}
            style={{top: top ?? 0}}
            className={cn(
              'pointer-events-auto absolute right-0 w-72 max-w-full',
              top === undefined && 'invisible',
              positionedCardIdsRef.current.includes(cardId) && 'transition-[top] duration-150'
            )}
          >
            {thread ? (
              <PageThreadCard
                threadRef={thread}
                pageId={pageId}
                viewerId={viewerId}
                isPageOwner={isPageOwner}
                isActive={cardId === activeThreadId}
                onActivate={() => editor.commands.setActivePageThread(cardId)}
              />
            ) : (
              <PageCommentDraftCard editor={editor} pageId={pageId} />
            )}
          </div>
        )
      })}
    </div>
  )
}
