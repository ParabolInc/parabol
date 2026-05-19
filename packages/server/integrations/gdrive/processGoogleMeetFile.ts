import {MarkdownManager} from '@tiptap/markdown'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TranscriptPageInput} from './attachTranscriptToSummaryPage'

const markdownManager = new MarkdownManager({extensions: serverTipTapExtensions})

const markdownToTipTap = (markdown: string): TipTapSerializedPageContent => {
  return markdownManager.parse(markdown) as TipTapSerializedPageContent
}

export const splitMarkdownIntoPages = (markdown: string): TranscriptPageInput[] => {
  // Split at each H1 heading, keeping the heading in its section
  const sections = markdown.split(/^(?=# )/m).filter((s) => s.trim())
  return sections
    .map((section) => {
      const firstLine = section.slice(0, section.indexOf('\n')).trim()
      const title = firstLine.replace(/^# /, '').trim()
      return {title, content: markdownToTipTap(section)}
    })
    .filter(({title}) => title.length > 0)
}
