import {TiptapCollabProvider, TiptapCollabProviderWebsocket} from '@hocuspocus/provider'
import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Focus from '@tiptap/extension-focus'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {TaskItem} from '@tiptap/extension-task-item'
import {TaskList} from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect, useRef, useState} from 'react'
import * as Y from 'yjs'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {ImageUpload} from '../tiptap/extensions/imageUpload/ImageUpload'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {ElementWidth} from '../types/constEnums'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import useAtmosphere from './useAtmosphere'

const isValid = <T>(obj: T | undefined | null | boolean): obj is T => {
  return !!obj
}
const CustomDocument = Document.extend({
  content: 'heading block*'
})

let socket: TiptapCollabProviderWebsocket
const makeHocusPocusSocket = (authToken: string | null) => {
  if (!socket) {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const host = __PRODUCTION__
      ? window.location.host
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
    teamId?: string
    placeholder?: string
  }
) => {
  const {teamId, placeholder} = options
  const atmosphere = useAtmosphere()
  const [doc] = useState(() => new Y.Doc())
  const placeholderRef = useRef(placeholder)
  placeholderRef.current = placeholder
  const editor = useEditor(
    {
      content: '',
      extensions: [
        CustomDocument,
        StarterKit.configure({document: false, history: false}),
        Underline,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        SlashCommand.configure({
          'Heading 1': false,
          'Heading 2': false,
          'To-do list': false
        }),
        Focus,
        ImageUpload.configure({
          editorWidth: ElementWidth.REFLECTION_CARD - 16 * 2,
          editorHeight: 88
        }),
        ImageBlock,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: () => {
            return placeholderRef.current || 'New page'
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
        CharacterCount.configure({
          // this is a rough estimate because we store the JSON content as a string, not plaintext
          limit: 1900
        }),
        Collaboration.configure({
          document: doc // Configure Y.Doc for collaboration
        }),
        CustomDocument
      ].filter(isValid),
      autofocus: true,
      editable: true
    },
    []
  )
  // Connect to your Collaboration server
  useEffect(() => {
    if (!pageId) return
    new TiptapCollabProvider({
      websocketProvider: makeHocusPocusSocket(atmosphere.authToken),
      token: atmosphere.authToken,
      name: `page:${pageId}`,
      document: doc
    })
  }, [])

  return {editor}
}
