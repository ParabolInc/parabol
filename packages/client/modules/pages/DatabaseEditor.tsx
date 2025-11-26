import type {HocuspocusProvider} from '@hocuspocus/provider'
import {useEffect} from 'react'
import type {useTipTapDatabaseEditor_viewer$key} from '../../__generated__/useTipTapDatabaseEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import {useTipTapDatabaseEditor} from '../../hooks/useTipTapDatabaseEditor'
import {cn} from '../../ui/cn'

interface Props {
  provider: HocuspocusProvider
  isEditable: boolean
  viewerRef: useTipTapDatabaseEditor_viewer$key | null
}

export const DatabaseEditor = (props: Props) => {
  const {provider, isEditable, viewerRef} = props
  const {editor} = useTipTapDatabaseEditor(provider, {viewerRef})
  useEffect(() => {
    editor?.setEditable(isEditable)
  }, [editor, isEditable])
  if (!editor) return <div>No editor</div>
  return (
    <>
      <TipTapEditor editor={editor} className={cn('page-editor flex w-full px-6 delay-300')} />
    </>
  )
}
