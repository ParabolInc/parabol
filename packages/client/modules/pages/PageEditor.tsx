import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/TipTapEditor/TipTapEditor'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {StarterActions} from './StarterActions'
import {useEditablePage} from './useEditablePage'

interface Props {
  provider: HocuspocusProvider
  isEditable: boolean
  viewerRef: useTipTapPageEditor_viewer$key | null
  pageId: string
}

export const PageEditor = (props: Props) => {
  const {provider, isEditable, viewerRef, pageId} = props
  const {editor} = useTipTapPageEditor(provider, {viewerRef, pageId})
  useEditablePage(provider, editor, isEditable)
  if (!editor) return <div>No editor</div>
  return (
    <>
      <TipTapEditor editor={editor} className={cn('page-editor flex w-full px-6 delay-300')} />
      {isEditable && <StarterActions editor={editor} />}
    </>
  )
}
