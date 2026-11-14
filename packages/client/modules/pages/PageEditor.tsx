import type {HocuspocusProvider} from '@hocuspocus/provider'
import {useRef} from 'react'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {BubbleTurnIntoMenu} from '../../components/TipTapEditor/BubbleTurnIntoMenu'
import {TipTapEditor} from '../../components/TipTapEditor/TipTapEditor'
import {useArrivalHighlight} from '../../hooks/useArrivalHighlight'
import {usePageViewerGrant} from '../../hooks/usePageViewerAccess'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {GQLID} from '../../utils/GQLID'
import {BlockDropHint} from './BlockDropHint'
import {BlockMarquee} from './BlockMarquee'
import {BlockSelectionAnnouncer} from './BlockSelectionAnnouncer'
import {StarterActions} from './StarterActions'
import {useEditablePage} from './useEditablePage'

interface Props {
  provider: HocuspocusProvider
  viewerRef: useTipTapPageEditor_viewer$key | null
  pageId: string
}

export const PageEditor = (props: Props) => {
  const {provider, viewerRef, pageId} = props
  const {editor} = useTipTapPageEditor(provider, {viewerRef, pageId})
  const isEditable = useEditablePage(provider, editor)
  const canCreateSubPage = !!usePageViewerGrant(GQLID.fromKey(pageId)[0])
  useArrivalHighlight(editor, pageId)
  const containerRef = useRef<HTMLDivElement>(null)
  if (!editor) return <div>No editor</div>
  return (
    <div ref={containerRef} className='flex w-full flex-col'>
      <TipTapEditor
        editor={editor}
        bubbleMenuStartContent={
          <BubbleTurnIntoMenu editor={editor} canCreateSubPage={canCreateSubPage} />
        }
        className={cn('page-editor relative flex w-full px-6 delay-300')}
      />
      <BlockDropHint />
      <BlockMarquee editor={editor} containerRef={containerRef} />
      <BlockSelectionAnnouncer editor={editor} />
      {isEditable && <StarterActions editor={editor} />}
    </div>
  )
}
