import type {HocuspocusProvider} from '@hocuspocus/provider'
import Collaboration from '@tiptap/extension-collaboration'
import {Document} from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Text from '@tiptap/extension-text'
import {useEditor} from '@tiptap/react'
import {useRef} from 'react'
import {Database} from '../tiptap/extensions/database/Database'
import {usePageLinkPlaceholder} from './usePageLinkPlaceholder'

export const useTipTapDatabaseEditor = (provider: HocuspocusProvider) => {
  const placeholderRef = useRef<string | undefined>(undefined)

  const editor = useEditor(
    {
      content: '',
      extensions: [
        Document.extend({
          content: 'heading database'
        }),
        Collaboration.configure({
          document: provider?.document
        }),
        Text,
        Heading.configure({
          levels: [1]
        }),
        Database.configure({
          document: provider?.document
        })
      ],
      autofocus: true,
      editable: true
    },
    [provider]
  )

  usePageLinkPlaceholder(editor!, placeholderRef)

  return {editor}
}
