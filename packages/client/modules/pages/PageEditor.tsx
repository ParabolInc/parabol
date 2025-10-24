import type {HocuspocusProvider} from '@hocuspocus/provider'
import {useEffect} from 'react'
import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'
import {cn} from '../../ui/cn'
import {StarterActions} from './StarterActions'

interface Props {
  provider: HocuspocusProvider
  isEditable: boolean
  viewerRef: useTipTapPageEditor_viewer$key | null
}

export const PageEditor = (props: Props) => {
  const {provider, isEditable, viewerRef} = props
  const {editor} = useTipTapPageEditor(provider, {viewerRef})
  useEffect(() => {
    editor?.setEditable(isEditable)
  }, [editor, isEditable])
  if (!editor) return <div>No editor</div>
  return (
    <>
      <TipTapEditor
        editor={editor}
        className={cn('page-editor flex w-full px-6 delay-300')}
        showDragHandle
      />
      {isEditable && <StarterActions editor={editor} />}
    </>
  )
}
