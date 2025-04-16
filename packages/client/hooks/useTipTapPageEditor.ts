import {TiptapCollabProvider, TiptapCollabProviderWebsocket} from '@hocuspocus/provider'
import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
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
import {useState} from 'react'
import {readInlineData} from 'relay-runtime'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import {Markdown} from 'tiptap-markdown'
import * as Y from 'yjs'
import type {useTipTapPageEditor_viewer$key} from '../__generated__/useTipTapPageEditor_viewer.graphql'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {themeBackgroundColors} from '../shared/themeBackgroundColors'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {toSlug} from '../shared/toSlug'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {ImageUpload} from '../tiptap/extensions/imageUpload/ImageUpload'
import {InsightsBlock} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {ElementWidth} from '../types/constEnums'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

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
  pageId: number,
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
  const [document] = useState(() => {
    const doc = new Y.Doc()
    const frag = doc.getXmlFragment('default')
    // update the URL to match the title
    frag.observeDeep((events) => {
      const docBlock = frag.get(0)
      const headerBlock = docBlock instanceof Y.XmlText ? docBlock : docBlock.get(0)
      for (const event of events) {
        for (const delta of event.delta) {
          if (delta.insert || delta.retain || delta.delete) {
            if (event.target === headerBlock) {
              const plaintext = generateText(
                generateJSON(headerBlock.toJSON(), serverTipTapExtensions),
                serverTipTapExtensions
              )
              const slug = toSlug(plaintext)
              const prefix = slug ? `${slug}-` : ''
              history.replace(`/pages/${prefix}${pageId}`)
            }
          }
        }
      }
    })
    return doc
  })
  // Connect to your Collaboration server
  const [provider] = useState(() => {
    if (!pageId) return
    return new TiptapCollabProvider({
      websocketProvider: makeHocusPocusSocket(atmosphere.authToken),
      name: `page:${pageId}`,
      document
    })
  })
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
            if (node.type.name === 'heading') {
              if (pos === 0) return 'New Page'
              return `Heading ${node.attrs.level}`
            }
            return "Press '/' for commands"
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
          document
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
        })
      ],
      autofocus: true,
      editable: true
    },
    []
  )
  return {editor}
}
