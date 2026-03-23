import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import {useEffect, useState} from 'react'

export const useEditablePage = (provider: HocuspocusProvider, editor: Editor) => {
  const [authorizedScope, setAuthorizedScope] = useState(provider.authorizedScope)

  useEffect(() => {
    const handler = ({scope}: {scope: string}) => setAuthorizedScope(scope)
    provider.on('authenticated', handler)
    return () => {
      provider.off('authenticated', handler)
    }
  }, [provider])

  const isEditable = authorizedScope !== 'readonly'

  useEffect(() => {
    if (editor.isEditable !== isEditable) {
      editor.setEditable(isEditable)
    }
  }, [editor, isEditable])

  return isEditable
}
