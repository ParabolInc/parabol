import type {Editor} from '@tiptap/core'

const PREVIEW_LENGTH = 60

const answerPreview = (editor: Editor | null | undefined, savedText: string) => {
  const liveText = editor && !editor.isDestroyed ? editor.getText() : ''
  const text = liveText.trim() ? liveText : savedText
  return text.replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LENGTH)
}

export default answerPreview
