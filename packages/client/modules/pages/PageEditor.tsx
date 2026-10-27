import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {PageLinkAccessProvider_page$key} from '../../__generated__/PageLinkAccessProvider_page.graphql'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/TipTapEditor/TipTapEditor'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {PageLinkAccessProvider} from './PageLinkAccessProvider'
import {StarterActions} from './StarterActions'
import {useEditablePage} from './useEditablePage'

interface Props {
  provider: HocuspocusProvider
  viewerRef: useTipTapPageEditor_viewer$key | null
  pageRef: PageLinkAccessProvider_page$key
  pageId: string
}

export const PageEditor = (props: Props) => {
  const {provider, viewerRef, pageRef, pageId} = props
  const {editor} = useTipTapPageEditor(provider, {viewerRef, pageId})
  const isEditable = useEditablePage(provider, editor)
  if (!editor) return <div>No editor</div>
  return (
    <div className='flex w-full flex-col'>
      <PageLinkAccessProvider pageRef={pageRef}>
        <TipTapEditor
          editor={editor}
          className={cn('page-editor relative flex w-full px-6 delay-300')}
        />
      </PageLinkAccessProvider>
      {isEditable && <StarterActions editor={editor} />}
    </div>
  )
}
