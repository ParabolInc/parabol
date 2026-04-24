import type {HocuspocusProvider} from '@hocuspocus/provider'
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

export const useEditablePage = (provider: HocuspocusProvider, editor: Editor) => {
  const [authorizedScope, setAuthorizedScope] = useState(provider.authorizedScope)
  const [isStreaming, setIsStreaming] = useState(() => hasThinkingBlock(provider.document))

  useEffect(() => {
    const handler = ({scope}: {scope: string}) => setAuthorizedScope(scope)
    provider.on('authenticated', handler)
    return () => {
      provider.off('authenticated', handler)
    }
  }, [provider])

  // Lock edits while the server is streaming summary blocks. The thinkingBlock
  // is inserted at publish time and removed once streaming finishes; its
  // presence is the authoritative signal that edits must not land yet.
  useEffect(() => {
    const frag = provider.document.getXmlFragment('default')
    const check = () => setIsStreaming(hasThinkingBlock(provider.document))
    check()
    frag.observe(check)
    return () => {
      frag.unobserve(check)
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
