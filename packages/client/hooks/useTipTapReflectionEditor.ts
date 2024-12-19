import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {Extension, generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect, useRef, useState} from 'react'
import Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {LinkMenuState} from '../components/promptResponse/TipTapLinkMenu'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {BlurOnSubmit} from '../utils/tiptap/BlurOnSubmit'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import {tiptapTagConfig} from '../utils/tiptapTagConfig'

const isValid = <T>(obj: T | undefined | null | boolean): obj is T => {
  return !!obj
}

export const useTipTapReflectionEditor = (
  content: string,
  options: {
    atmosphere?: Atmosphere
    teamId?: string
    readOnly?: boolean
    placeholder?: string
    onEnter?: () => void
    // onEscape?: () => void
  }
) => {
  const {atmosphere, teamId, readOnly, placeholder, onEnter} = options
  const [linkState, setLinkState] = useState<LinkMenuState>(null)
  const [contentJSON] = useState(() => JSON.parse(content))
  const placeholderRef = useRef(placeholder)
  placeholderRef.current = placeholder
  const editor = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: () => {
            return placeholderRef.current || '*New Reflection*'
          }
        }),
        Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false,
          popover: {
            setLinkState
          }
        }),
        SearchAndReplace.configure(),
        onEnter &&
          Extension.create({
            name: 'commentKeyboardShortcuts',
            addKeyboardShortcuts(this) {
              return {
                Enter: () => {
                  onEnter()
                  return true
                }
                // Escape: () => {
                //   onEscape()
                //   return true
                // }
              }
            }
          }),
        !onEnter && BlurOnSubmit
      ].filter(isValid),
      autofocus: generateText(contentJSON, serverTipTapExtensions).length === 0,
      editable: !readOnly
    },
    []
  )
  useEffect(() => {
    if (!editor) return
    const oldDoc = editor.getJSON()
    const newDoc = JSON.parse(content)
    if (isEqualWhenSerialized(oldDoc, newDoc)) return
    editor.commands.setContent(newDoc)
  }, [content])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [readOnly])

  return {editor, linkState, setLinkState}
}
