import type {AuthorizedScope, HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import {useEffect, useState} from 'react'
import type * as Y from 'yjs'
import {XmlElement} from 'yjs'

const hasThinkingBlock = (doc: Y.Doc) => {
  const frag = doc.getXmlFragment('default')
  return frag
    .toArray()
    .some((node) => node instanceof XmlElement && node.nodeName === 'thinkingBlock')
}

// The thinkingBlock is inserted at publish time and removed once streaming
// finishes; its presence is the authoritative signal that the summary is
// still generating (edit lock, export lock).
export const useIsPageStreaming = (provider: HocuspocusProvider | null) => {
  const [isStreaming, setIsStreaming] = useState(() =>
    provider ? hasThinkingBlock(provider.document) : false
  )
  useEffect(() => {
    if (!provider) return
    const frag = provider.document.getXmlFragment('default')
    const check = () => setIsStreaming(hasThinkingBlock(provider.document))
    check()
    frag.observe(check)
    return () => {
      frag.unobserve(check)
    }
  }, [provider])
  return isStreaming
}

export const useEditablePage = (provider: HocuspocusProvider, editor: Editor) => {
  const [authorizedScope, setAuthorizedScope] = useState(provider.authorizedScope)
  // Lock edits while the server is streaming summary blocks
  const isStreaming = useIsPageStreaming(provider)

  useEffect(() => {
    const handler = ({scope}: {scope: AuthorizedScope}) => setAuthorizedScope(scope)
    provider.on('authenticated', handler)
    return () => {
      provider.off('authenticated', handler)
    }
  }, [provider])

  const isEditable = authorizedScope !== 'readonly' && !isStreaming

  useEffect(() => {
    if (editor.isEditable !== isEditable) {
      editor.setEditable(isEditable)
    }
  }, [editor, isEditable])

  return isEditable
}
