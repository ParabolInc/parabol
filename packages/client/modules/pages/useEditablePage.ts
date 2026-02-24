import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'

export const useEditablePage = (
  provider: HocuspocusProvider,
  editor: Editor,
  isEditable: boolean
) => {
  useEffect(() => {
    const isAuthorizedToEdit = provider.authorizedScope !== 'readonly'
    const nextEditable = isAuthorizedToEdit ? isEditable : false
    if (isEditable !== nextEditable) {
      editor?.setEditable(nextEditable)
    }
  }, [editor, isEditable, provider.authorizedScope])
}
