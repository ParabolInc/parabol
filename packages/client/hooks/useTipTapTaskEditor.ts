import {TaskItem, TaskList} from '@tiptap/extension-list'
import Mention from '@tiptap/extension-mention'
import {Placeholder} from '@tiptap/extensions'
import {Extension, generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useUploadUserAsset} from '~/mutations/useUploadUserAsset'
import type Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/TipTapEditor/LoomExtension'
import {TiptapLinkExtension} from '../components/TipTapEditor/TiptapLinkExtension'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {FileUpload} from '../tiptap/extensions/fileUpload/FileUpload'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {ElementWidth} from '../types/constEnums'
import {MentionTaskTag} from '../utils/MentionTaskTag'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import {tiptapTagConfig} from '../utils/tiptapTagConfig'
import {useTipTapEditorContent} from './useTipTapEditorContent'

export const useTipTapTaskEditor = (
  content: string,
  options: {
    atmosphere?: Atmosphere
    teamId?: string
    readOnly?: boolean
    // onBlur here vs. on the component means when the component mounts with new editor content
    // (e.g. HeaderCard changes taskId) the onBlur won't fire, which is probably desireable
    onBlur?: () => void
    onModEnter?: () => void
  }
) => {
  const {atmosphere, teamId, readOnly, onBlur, onModEnter} = options
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  const [commit] = useUploadUserAsset()

  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit.configure({link: false}),
        FileUpload.configure({
          scopeKey: teamId,
          assetScope: 'Team',
          highestTier: 'starter',
          commit
        }),
        ImageBlock.configure({
          editorWidth: ElementWidth.REFLECTION_CARD - 16 * 2,
          editorHeight: 88
        }),
        LoomExtension,
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        MentionTaskTag.configure(tiptapTagConfig),
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: 'Describe what “Done” looks like'
        }),
        SlashCommand.configure({
          'Heading 1': false,
          'Heading 2': false,
          'To-do list': false,
          Insights: false,
          Table: false,
          Details: false,
          'Create page': false,
          Database: false
        }),
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
        Extension.create({
          name: 'taskEditorKeyboardShortcuts',
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
      ],
      editable: !readOnly,
      onBlur,
      autofocus: generateText(contentJSON, serverTipTapExtensions).length === 0
    },
    [contentJSON, readOnly, onBlur]
  )
  return {editor: editorRef.current}
}
