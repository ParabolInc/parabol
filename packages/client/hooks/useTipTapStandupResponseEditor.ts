import type {Extensions} from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type Atmosphere from '../Atmosphere'
import {standupBlockExtensions} from '../components/TeamPrompt/standupEditorExtensions'
import {LoomExtension} from '../components/TipTapEditor/LoomExtension'
import {TiptapLinkExtension} from '../components/TipTapEditor/TiptapLinkExtension'
import type {useUploadUserAsset} from '../mutations/useUploadUserAsset'
import {useUploadUserAsset as useUploadUserAssetMutation} from '../mutations/useUploadUserAsset'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import {MentionTaskTag} from '../utils/MentionTaskTag'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapTagConfig} from '../utils/tiptapTagConfig'
import useAtmosphere from './useAtmosphere'
import {useTipTapEditorContent} from './useTipTapEditorContent'

interface Options {
  atmosphere: Atmosphere
  commit: ReturnType<typeof useUploadUserAsset>[0]
  editorWidth: number
}

export const standupResponseExtensions = ({
  atmosphere,
  commit,
  editorWidth
}: Options): Extensions => [
  StarterKit.configure({link: false}),
  TiptapLinkExtension.configure({openOnClick: false}),
  Mention.configure(mentionConfig),
  Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
  MentionTaskTag.configure(tiptapTagConfig),
  LoomExtension,
  ...standupBlockExtensions({atmosphere, commit, editorWidth})
]

export const useTipTapStandupResponseEditor = (content: string, editorWidth: number) => {
  const atmosphere = useAtmosphere()
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  const [commit] = useUploadUserAssetMutation()

  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: standupResponseExtensions({atmosphere, commit, editorWidth}),
      editable: false
    },
    [contentJSON]
  )
  return {editor: editorRef.current}
}
