import {TiptapCollabProvider, TiptapCollabProviderWebsocket} from '@hocuspocus/provider'
import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import type {EditorEvents} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Document from '@tiptap/extension-document'
import Focus from '@tiptap/extension-focus'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {TaskItem} from '@tiptap/extension-task-item'
import {TaskList} from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import {generateJSON, generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import graphql from 'babel-plugin-relay/macro'
import type {History} from 'history'
import {useEffect, useMemo, useRef} from 'react'
import {commitLocalUpdate, readInlineData} from 'relay-runtime'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import {Markdown} from 'tiptap-markdown'
import * as Y from 'yjs'
import type {useTipTapPageEditor_viewer$key} from '../__generated__/useTipTapPageEditor_viewer.graphql'
import type Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {themeBackgroundColors} from '../shared/themeBackgroundColors'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {toSlug} from '../shared/toSlug'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {ImageUpload} from '../tiptap/extensions/imageUpload/ImageUpload'
import {InsightsBlock} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {PageLinkPicker} from '../tiptap/extensions/pageLinkPicker/PageLinkPicker'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {ElementWidth} from '../types/constEnums'
import type {FirstParam} from '../types/generics'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

let currentPrefix: string | undefined = undefined
const updateUrlWithSlug = (
  headerBlock: Y.XmlText,
  pageIdNum: number,
  history: History,
  atmosphere: Atmosphere
) => {
  const plaintext = generateText(
    generateJSON(headerBlock.toJSON(), serverTipTapExtensions),
    serverTipTapExtensions
  )
  const slug = toSlug(plaintext)
  const prefix = slug ? `${slug}-` : ''
  if (prefix === currentPrefix) return
  currentPrefix = prefix
  history.replace(`/pages/${prefix}${pageIdNum}`)
  commitLocalUpdate(atmosphere, (store) => {
    const title = plaintext.slice(0, 255)
    store.get(`page:${pageIdNum}`)?.setValue(title, 'title')
  })
}
const colorIdx = Math.floor(Math.random() * themeBackgroundColors.length)
let socket: TiptapCollabProviderWebsocket
const makeHocusPocusSocket = (authToken: string | null) => {
  if (!socket) {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const host = __PRODUCTION__
      ? `${window.location.host}/hocuspocus`
      : `${window.location.hostname}:${__HOCUS_POCUS_PORT__}`
    const baseUrl = `${wsProtocol}//${host}?token=${authToken}`
    socket = new TiptapCollabProviderWebsocket({
      baseUrl
    })
  }
  return socket
}

export const useTipTapPageEditor = (
  pageId: string,
  options: {
    viewerRef: useTipTapPageEditor_viewer$key | null
    teamId?: string
  }
) => {
  const {viewerRef, teamId} = options
  const user = readInlineData(
    graphql`
      fragment useTipTapPageEditor_viewer on User @inline {
        preferredName
      }
    `,
    viewerRef
  )
  const preferredName = user?.preferredName
  const atmosphere = useAtmosphere()
  const {history} = useRouter<{meetingId: string}>()
  const pageIdNum = Number(pageId.split(':')[1])
  const providerRef = useRef<TiptapCollabProvider>()
  // Connect to your Collaboration server
  providerRef.current = useMemo(() => {
    if (!pageId) return undefined
    if (providerRef.current) {
      providerRef.current.destroy()
    }
    const doc = new Y.Doc()
    const frag = doc.getXmlFragment('default')
    // update the URL to match the title
    const nextProvider = new TiptapCollabProvider({
      websocketProvider: makeHocusPocusSocket(atmosphere.authToken),
      name: pageId,
      document: doc
    })

    const observeHeader = (headerBlock: Y.XmlText) => {
      updateUrlWithSlug(headerBlock, pageIdNum, history, atmosphere)
      headerBlock.observe(() => {
        updateUrlWithSlug(headerBlock, pageIdNum, history, atmosphere)
      })
    }
    const observeFragForHeader: FirstParam<Y.AbstractType<Y.YXmlEvent>['observeDeep']> = () => {
      const headerElement = frag.get(0) as Y.XmlElement | null
      const headerText = headerElement?.get(0) as Y.XmlText
      if (headerText) {
        observeHeader(headerText)
        frag.unobserveDeep(observeFragForHeader)
      }
    }
    nextProvider.on('synced', () => {
      const headerElement = frag.get(0) as Y.XmlElement | null
      const headerText = headerElement?.get(0) as Y.XmlText
      if (headerText) {
        observeHeader(headerText)
      } else {
        // header doesn't exist yet, observe the whole doc
        frag.observeDeep(observeFragForHeader)
      }
    })
    return nextProvider
  }, [pageId, atmosphere.authToken])

  const placeholderRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const setPageLinkPlaceholder = ({willOpen}: EditorEvents['pageLinkPicker']) => {
      console.log('set placeholder', willOpen)
      const nextValue = willOpen ? 'Search for a page…' : undefined
      placeholderRef.current = nextValue
      // using state would trigger a re-render, resetting cursor position, so we use ref
      // ref won't trigger an update, so we manually change the placeholder for the first render
      const emptyEl = editor?.view.domAtPos(editor.state.selection.from)
        ?.node as HTMLParagraphElement
      emptyEl?.setAttribute('data-placeholder', nextValue || "Press '/' for commands")
    }
    editor?.on('pageLinkPicker', setPageLinkPlaceholder)
    return () => {
      editor?.off('pageLinkPicker', setPageLinkPlaceholder)
    }
  }, [])
  const provider = providerRef.current
  const editor = useEditor(
    {
      content: '',
      extensions: [
        Document.extend({
          content: 'heading block*'
        }),
        StarterKit.configure({
          document: false,
          history: false
        }),
        Underline,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        SlashCommand.configure({}),
        Focus,
        ImageUpload.configure({
          editorWidth: ElementWidth.REFLECTION_CARD - 16 * 2,
          editorHeight: 88
        }),
        ImageBlock,
        LoomExtension,
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
        CollaborationCursor.configure({
          provider,
          user: {
            name: preferredName,
            color: `#${themeBackgroundColors[colorIdx]}`
          }
        }),
        InsightsBlock,
        GlobalDragHandle,
        AutoJoiner,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true
        }),
        PageLinkPicker
      ],
      autofocus: true,
      editable: true
    },
    [provider]
  )
  useEffect(() => {
    return () => {
      provider?.destroy()
    }
  }, [])
  return {editor}
}
