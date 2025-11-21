import type {HocuspocusProvider} from '@hocuspocus/provider'
import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import Collaboration from '@tiptap/extension-collaboration'
import {CollaborationCaret} from '@tiptap/extension-collaboration-caret'
import {Details, DetailsContent, DetailsSummary} from '@tiptap/extension-details'
import {Document} from '@tiptap/extension-document'
import DragHandle from '@tiptap/extension-drag-handle'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import Mention from '@tiptap/extension-mention'
import {TableRow} from '@tiptap/extension-table'
import {Focus, Placeholder} from '@tiptap/extensions'
import type {Node} from '@tiptap/pm/model'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import {Markdown} from 'tiptap-markdown'
import type {useTipTapPageEditor_viewer$key} from '../__generated__/useTipTapPageEditor_viewer.graphql'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {themeBackgroundColors} from '../shared/themeBackgroundColors'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {ImageUpload} from '../tiptap/extensions/imageUpload/ImageUpload'
import {InsightsBlock} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {ResponseBlock} from '../tiptap/extensions/insightsBlock/ResponseBlock'
import {TaskBlock} from '../tiptap/extensions/insightsBlock/TaskBlock'
import {ThinkingBlock} from '../tiptap/extensions/insightsBlock/ThinkingBlock'
import {PageLinkBlock} from '../tiptap/extensions/pageLinkBlock/PageLinkBlock'
import {PageLinkPicker} from '../tiptap/extensions/pageLinkPicker/PageLinkPicker'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {Table} from '../tiptap/extensions/table/Table'
import {TableCell} from '../tiptap/extensions/table/TableCell'
import {TableHeader} from '../tiptap/extensions/table/TableHeader'
import {ElementWidth} from '../types/constEnums'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import useAtmosphere from './useAtmosphere'
import {usePageLinkPlaceholder} from './usePageLinkPlaceholder'

function isEmptyParagraph(node: Node) {
  return node.type.name === 'paragraph' && node.textContent.length === 0
}
const dragHandleElement = document.createElement('div')

const colorIdx = Math.floor(Math.random() * themeBackgroundColors.length)
export const useTipTapPageEditor = (
  provider: HocuspocusProvider,
  options: {
    pageId: string
    viewerRef: useTipTapPageEditor_viewer$key | null
    teamId?: string
  }
) => {
  const {pageId, viewerRef, teamId} = options
  const user = readInlineData(
    graphql`
      fragment useTipTapPageEditor_viewer on User @inline {
        preferredName
        organizations {
          hasDatabases: featureFlag(featureName: "Databases")
        }
      }
    `,
    viewerRef
  )
  const preferredName = user?.preferredName
  const hasDatabases = !!user?.organizations?.find((org) => org?.hasDatabases)
  const atmosphere = useAtmosphere()
  const placeholderRef = useRef<string | undefined>(undefined)
  const editor = useEditor(
    {
      content: '',
      extensions: [
        Document.extend({
          content: 'heading block*'
        }),
        StarterKit.configure({
          document: false,
          undoRedo: false,
          link: false
        }),
        Details.configure({
          persist: true,
          HTMLAttributes: {
            class: 'details'
          }
        }),
        DetailsSummary,
        DetailsContent,
        Table.configure({
          allowTableNodeSelection: true
        }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        SlashCommand.configure({
          Database: hasDatabases
        }),
        Focus,
        ImageUpload.configure({
          editorWidth: ElementWidth.REFLECTION_CARD - 16 * 2,
          editorHeight: 88,
          scopeKey: pageId,
          assetScope: 'Page'
        }),
        ImageBlock,
        LoomExtension,
        DragHandle.configure({
          // drag-handle-react breaks when clicking pageLinkBlocks because it removes a react child w/o telling react
          // So we do this outside of react
          render: () => {
            dragHandleElement.classList.add('drag-handle', 'hide')
            return dragHandleElement
          },
          onNodeChange: ({node}) => {
            const isEmpty = node ? isEmptyParagraph(node) : false
            const isHidden = dragHandleElement.classList.contains('hide')
            if (isEmpty !== isHidden) {
              if (isEmpty) {
                dragHandleElement.classList.add('hide')
              } else {
                dragHandleElement.classList.remove('hide')
              }
            }
          }
        }),
        Placeholder.configure({
          showOnlyWhenEditable: false,
          includeChildren: true,
          placeholder: ({node, pos}) => {
            if (placeholderRef.current) {
              return placeholderRef.current
            }
            const {type, attrs} = node
            const {name} = type
            switch (name) {
              case 'heading':
                if (pos === 0) return 'New Page'
                return `Heading ${attrs.level}`
              case 'codeBlock':
                return 'New code'
              case 'blockquote':
                return 'New quote'
              case 'paragraph':
                return "Press '/' for commands"
              case 'detailsSummary':
                return 'New summary'
              case 'detailsContent':
                return 'Add details, use / to add blocks'
              case 'bulletList':
              case 'listItem':
              case 'orderedList':
              default:
                return ''
            }
          }
        }),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
        SearchAndReplace.configure(),
        Collaboration.configure({
          document: provider?.document
        }),
        CollaborationCaret.configure({
          provider,
          user: {
            name: preferredName,
            color: `#${themeBackgroundColors[colorIdx]}`
          }
        }),
        InsightsBlock,
        AutoJoiner,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true
        }),
        PageLinkPicker.configure({
          atmosphere
        }),
        PageLinkBlock.configure({yDoc: provider.document}),
        TaskBlock,
        ThinkingBlock,
        ResponseBlock
      ],
      autofocus: true,
      editable: true
    },
    [provider]
  )

  usePageLinkPlaceholder(editor!, placeholderRef)

  return {editor}
}
