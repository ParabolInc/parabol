import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {useTipTapDatabaseEditor_viewer$key} from '../../__generated__/useTipTapDatabaseEditor_viewer.graphql'
import {TipTapEditor} from '../../components/TipTapEditor/TipTapEditor'
import {useTipTapDatabaseEditor} from '../../hooks/useTipTapDatabaseEditor'
import {cn} from '../../ui/cn'
import {useEditablePage} from './useEditablePage'

interface Props {
  provider: HocuspocusProvider
  isEditable: boolean
  viewerRef: useTipTapDatabaseEditor_viewer$key | null
}

export const DatabaseEditor = (props: Props) => {
  const {provider, isEditable, viewerRef} = props
  const {editor} = useTipTapDatabaseEditor(provider, {viewerRef})
  useEditablePage(provider, editor, isEditable)
  if (!editor) return <div>No editor</div>
  return (
    <>
      <TipTapEditor editor={editor} className={cn('page-editor flex w-full px-6 delay-300')} />
    </>
  )
}
