import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TranscriptPageInput} from './attachTranscriptToSummaryPage'

export const getGoogleDocLinkPage = (name: string, webViewLink: string): TranscriptPageInput => {
  const title = 'Gemini Notes'
  const content: TipTapSerializedPageContent = {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]},
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: `${name} — `},
          {
            type: 'text',
            text: 'Open in Google Docs',
            marks: [{type: 'link', attrs: {href: webViewLink, target: '_blank'}}]
          }
        ]
      }
    ]
  }
  return {title, content}
}
