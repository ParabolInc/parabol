import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import Mention from '@tiptap/extension-mention'
import {CharacterCount, Focus, Placeholder} from '@tiptap/extensions'
import {Extension, generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect, useRef, useState} from 'react'
import type Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {ClearOnSubmit} from '../tiptap/extensions/ClearOnSubmit'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {ImageUpload} from '../tiptap/extensions/imageUpload/ImageUpload'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {ElementWidth} from '../types/constEnums'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {Details, DetailsContent, DetailsSummary} from '@tiptap/extension-details'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'

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
    onModEnter?: () => void
  }
) => {
  const {atmosphere, teamId, readOnly, placeholder, onModEnter} = options
  const [contentJSON] = useState(() => JSON.parse(content))
  const placeholderRef = useRef(placeholder)
  placeholderRef.current = placeholder
  const editor = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit.configure({link: false}),
        Details.configure({
          persist: true,
          HTMLAttributes: {
            class: 'details'
          }
        }),
        DetailsSummary,
        DetailsContent,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        SlashCommand.configure({
          'Heading 1': false,
          'Heading 2': false,
          'To-do list': false,
          Insights: false,
          'Table': false,
          'Details': false,
          'Create page': false,
        }),
        ClearOnSubmit,
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
            return placeholderRef.current || '*New Reflection*'
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
        Extension.create({
          name: 'reflectKeyboardShortcuts',
          addKeyboardShortcuts(this) {
            return {
              'Mod-Enter': () => {
                if (onModEnter) {
                  onModEnter()
                  return true
                }
                return false
              }
            }
          }
        })
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

  return {editor}
}
