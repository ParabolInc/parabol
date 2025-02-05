import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {mentionConfig, serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
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
  }
) => {
  const {atmosphere, teamId, readOnly, onBlur} = options
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        Underline,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: 'Describe what “Done” looks like'
        }),
        Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
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
