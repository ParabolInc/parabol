import type {HocuspocusProvider} from '@hocuspocus/provider'
import Collaboration from '@tiptap/extension-collaboration'
import {Document} from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Text from '@tiptap/extension-text'
import {useEditor} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import type {useTipTapDatabaseEditor_viewer$key} from '../__generated__/useTipTapDatabaseEditor_viewer.graphql'
import {Database} from '../tiptap/extensions/database/Database'
import {usePageLinkPlaceholder} from './usePageLinkPlaceholder'

export const useTipTapDatabaseEditor = (
  provider: HocuspocusProvider,
  options: {
    viewerRef: useTipTapDatabaseEditor_viewer$key | null
  }
) => {
  const {viewerRef} = options
  const user = readInlineData(
    graphql`
      fragment useTipTapDatabaseEditor_viewer on User @inline {
        id
      }
    `,
    viewerRef
  )
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
          document: provider?.document,
          userId: user?.id
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
