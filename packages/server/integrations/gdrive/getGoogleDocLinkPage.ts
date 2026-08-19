import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TranscriptPageInput} from './attachTranscriptToSummaryPage'

export const getGoogleDocLinkPage = (name: string, webViewLink: string): TranscriptPageInput => {
  const content: TipTapSerializedPageContent = {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: name}]},
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: "Parabol couldn't import these notes yet. "},
          {
            type: 'text',
            text: 'Open them in Google Docs',
            marks: [{type: 'link', attrs: {href: webViewLink, target: '_blank'}}]
          }
        ]
      }
    ]
  }
  return {title: name, content}
}
