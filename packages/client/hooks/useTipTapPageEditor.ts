import type {HocuspocusProvider} from '@hocuspocus/provider'
import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import Collaboration from '@tiptap/extension-collaboration'
import {CollaborationCaret} from '@tiptap/extension-collaboration-caret'
import {Details, DetailsContent, DetailsSummary} from '@tiptap/extension-details'
import {Document} from '@tiptap/extension-document'
import {FileHandler} from '@tiptap/extension-file-handler'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import Mention from '@tiptap/extension-mention'
import {TableRow} from '@tiptap/extension-table'
import {Focus, Placeholder} from '@tiptap/extensions'
import {Markdown} from '@tiptap/markdown'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import type {useTipTapPageEditor_viewer$key} from '../__generated__/useTipTapPageEditor_viewer.graphql'
import {LoomExtension} from '../components/TipTapEditor/LoomExtension'
import {TiptapLinkExtension} from '../components/TipTapEditor/TiptapLinkExtension'
import {useUploadUserAsset} from '../mutations/useUploadUserAsset'
import {themeBackgroundColors} from '../shared/themeBackgroundColors'
import FileBlock from '../tiptap/extensions/fileBlock/FileBlock'
import {FileUpload} from '../tiptap/extensions/fileUpload/FileUpload'
import {IndentHandler} from '../tiptap/extensions/IndentHandler'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {InsightsBlock} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {ResponseBlock} from '../tiptap/extensions/insightsBlock/ResponseBlock'
import {TaskBlock} from '../tiptap/extensions/insightsBlock/TaskBlock'
import {ThinkingBlock} from '../tiptap/extensions/insightsBlock/ThinkingBlock'
import {PageDragHandle} from '../tiptap/extensions/PageDragHandle'
import {PageLinkBlock} from '../tiptap/extensions/pageLinkBlock/PageLinkBlock'
import {PageLinkPicker} from '../tiptap/extensions/pageLinkPicker/PageLinkPicker'
import {PageUserMention} from '../tiptap/extensions/pageUserMention/PageUserMention'
import {pageUserSuggestion} from '../tiptap/extensions/pageUserMention/pageUserSuggestion'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {Table} from '../tiptap/extensions/table/Table'
import {TableCell} from '../tiptap/extensions/table/TableCell'
import {TableHeader} from '../tiptap/extensions/table/TableHeader'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import useAtmosphere from './useAtmosphere'
import {usePageLinkPlaceholder} from './usePageLinkPlaceholder'

const getFileType = (file: File) => {
  if (file.type.includes('image')) return 'image'
  if (file.type.includes('text/csv')) return 'csv'
  return 'file'
}
const colorIdx = Math.floor(Math.random() * themeBackgroundColors.length)
export const useTipTapPageEditor = (
  provider: HocuspocusProvider,
  options: {
    pageId: string
    viewerRef: useTipTapPageEditor_viewer$key | null
    teamId?: string
  }
) => {
  const {pageId, viewerRef} = options
  const user = readInlineData(
    graphql`
      fragment useTipTapPageEditor_viewer on User @inline {
        preferredName
        highestTier
        organizations {
          hasDatabases: featureFlag(featureName: "Databases")
        }
      }
    `,
    viewerRef
  )
  const [commit] = useUploadUserAsset()
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
          link: false,
          trailingNode: {
            node: 'paragraph'
          }
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
        FileUpload.configure({
          scopeKey: pageId,
          assetScope: 'Page',
          atmosphere,
          commit,
          highestTier: user?.highestTier
        }),
        ImageBlock.configure({
          editorWidth: 960,
          editorHeight: 400
        }),
        IndentHandler,
        LoomExtension,
        PageDragHandle.configure({pageId, atmosphere}),
        Placeholder.configure({
          showOnlyWhenEditable: false,
          includeChildren: true,
          emptyNodeClass: 'is-empty print:hidden',
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
        PageUserMention.configure({
          atmosphere,
          suggestion: pageUserSuggestion
        }),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
        SearchAndReplace,
        Collaboration.configure({
          document: provider?.document
        }),
        CollaborationCaret.configure({
          render(user) {
            const cursor = document.createElement('span')
            let downAt: number | undefined = undefined
            cursor.addEventListener('pointerdown', () => {
              // sometimes the cursor can get in the way
              // If the user gets frustrated enough to click it, hide it for 5 seconds
              // if they tap & hold it out of rage, remove it indefinitely
              // it'll re-appear when the remote user moves it
              downAt = Date.now()
            })
            cursor.addEventListener('pointerup', () => {
              cursor.classList.add('hidden')
              const pressDuration = downAt ? Date.now() - downAt : 0
              if (pressDuration > 300) return
              setTimeout(() => {
                if (cursor.isConnected) {
                  cursor.classList.remove('hidden')
                }
              }, 5000)
            })
            cursor.classList.add(
              'collaboration-carets__caret',
              '-mx-px',
              'relative',
              'break-normal',
              'border-x-slate-900',
              'border',
              'transition-opacity',
              'hover:cursor-text',
              'hover:opacity-20',
              'print:hidden'
            )
            cursor.setAttribute('style', `border-color: ${user.color}`)

            const label = document.createElement('div')
            label.classList.add(
              'collaboration-carets__label',
              '-left-px',
              '-top-5',
              'absolute',
              'select-none',
              'whitespace-nowrap',
              'rounded-t-sm',
              'rounded-br-sm',
              'px-1',
              'py-0.5',
              'font-semibold',
              'text-white',
              'text-xs'
            )
            label.setAttribute('style', `background-color: ${user.color}`)
            label.insertBefore(document.createTextNode(user.name), null)
            cursor.insertBefore(label, null)

            return cursor
          },
          provider,
          user: {
            name: preferredName,
            color: `#${themeBackgroundColors[colorIdx]}`
          }
        }),
        InsightsBlock,
        AutoJoiner,
        Markdown,
        PageLinkPicker.configure({
          atmosphere
        }),
        PageLinkBlock.configure({yDoc: provider.document}),
        TaskBlock,
        ThinkingBlock,
        ResponseBlock,
        FileBlock,
        FileHandler.configure({
          onDrop: (currentEditor, files, pos) => {
            files.forEach(async (file) => {
              // if they drop an image, treat it like an image, not a binary
              const targetType = getFileType(file)
              if (targetType === 'csv') {
                console.log('Emitting importCSV event for dropped file', {file, targetType, pos})
                currentEditor.emit('importCSV', {file, targetType, pos})
                return
              }
              currentEditor.storage.fileUpload.onUpload(file, currentEditor, targetType, pos)
            })
          },
          onPaste: (currentEditor, files, htmlContent) => {
            files.forEach((file) => {
              if (!htmlContent) {
                const targetType = getFileType(file)
                if (targetType === 'csv') {
                  currentEditor.emit('importCSV', {file, targetType, pos: undefined})
                  return
                }
                currentEditor.storage.fileUpload.onUpload(file, currentEditor, targetType)
              }
            })
          }
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
