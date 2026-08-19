import type {docs_v1} from 'googleapis'
import type {
  TipTapContentNode,
  TipTapSerializedPageContent,
  TipTapTextNode
} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TranscriptPageInput} from './attachTranscriptToSummaryPage'

type ListNode = Extract<TipTapContentNode, {type: 'bulletList' | 'orderedList'}>
type ListItemNode = ListNode['content'][number]
type ParagraphNode = Extract<TipTapContentNode, {type: 'paragraph'}>
type HeadingNode = Extract<TipTapContentNode, {type: 'heading'}>
type Lists = {[listId: string]: docs_v1.Schema$List}
// googleapis@166 does not yet type dateElement, which Gemini docs use for the meeting date
export type ParagraphElement = docs_v1.Schema$ParagraphElement & {
  dateElement?: {dateElementProperties?: {displayText?: string | null}}
}

const SOFT_BREAK = '\u000b'
const ORDERED_GLYPHS = new Set([
  'DECIMAL',
  'ZERO_DECIMAL',
  'ALPHA',
  'UPPER_ALPHA',
  'ROMAN',
  'UPPER_ROMAN'
])

const HEADING_LEVELS: Record<string, HeadingNode['attrs']['level']> = {
  TITLE: 2,
  SUBTITLE: 2,
  HEADING_1: 2,
  HEADING_2: 2,
  HEADING_3: 3,
  HEADING_4: 4,
  HEADING_5: 5,
  HEADING_6: 6
}

const getMarks = (style: docs_v1.Schema$TextStyle | undefined) => {
  if (!style) return undefined
  const marks: TipTapTextNode['marks'] = []
  if (style.bold) marks.push({type: 'bold'})
  if (style.italic) marks.push({type: 'italic'})
  if (style.underline) marks.push({type: 'underline'})
  if (style.strikethrough) marks.push({type: 'strike'})
  if (style.link?.url) marks.push({type: 'link', attrs: {href: style.link.url, target: '_blank'}})
  return marks.length > 0 ? marks : undefined
}

const textNode = (text: string, marks?: TipTapTextNode['marks']): TipTapTextNode =>
  marks ? {type: 'text', text, marks} : {type: 'text', text}

// A Docs paragraph may hold soft line breaks; each line becomes its own TipTap paragraph
const getParagraphLines = (paragraph: docs_v1.Schema$Paragraph) => {
  const lines: TipTapTextNode[][] = [[]]
  const push = (text: string, marks?: TipTapTextNode['marks']) => {
    if (text) lines[lines.length - 1]!.push(textNode(text, marks))
  }
  for (const element of (paragraph.elements ?? []) as ParagraphElement[]) {
    const {textRun, person, richLink, dateElement} = element
    if (textRun) {
      const marks = getMarks(textRun.textStyle)
      const segments = (textRun.content ?? '').replace(/\n$/, '').split(SOFT_BREAK)
      segments.forEach((segment, idx) => {
        if (idx > 0) lines.push([])
        push(segment, marks)
      })
    } else if (person) {
      const {name, email} = person.personProperties ?? {}
      push(name || email || '')
    } else if (richLink) {
      const {title, uri} = richLink.richLinkProperties ?? {}
      const label = title || uri || ''
      push(label, uri ? [{type: 'link', attrs: {href: uri, target: '_blank'}}] : undefined)
    } else if (dateElement) {
      push(dateElement.dateElementProperties?.displayText ?? '')
    }
  }
  return lines.filter((line) => line.some(({text}) => text.trim().length > 0))
}

const toParagraph = (line: TipTapTextNode[]): ParagraphNode => ({
  type: 'paragraph',
  content: [line[0]!, ...line.slice(1)]
})

const isOrderedList = (lists: Lists, listId: string, level: number) => {
  const glyphType = lists[listId]?.listProperties?.nestingLevels?.[level]?.glyphType
  return !!glyphType && ORDERED_GLYPHS.has(glyphType)
}

const makeList = (ordered: boolean, items: ListItemNode[]): ListNode =>
  ordered
    ? {type: 'orderedList', attrs: {start: 1, type: null}, content: items}
    : {type: 'bulletList', attrs: {}, content: items}

type BulletParagraph = {level: number; lines: TipTapTextNode[][]}

const buildList = (
  bullets: BulletParagraph[],
  lists: Lists,
  listId: string,
  level: number
): ListNode => {
  const items: ListItemNode[] = []
  let idx = 0
  while (idx < bullets.length) {
    const bullet = bullets[idx]!
    if (bullet.level < level) break
    const parent = items[items.length - 1]
    if (bullet.level > level && parent) {
      const childStart = idx
      while (idx < bullets.length && bullets[idx]!.level > level) idx++
      parent.content.push(buildList(bullets.slice(childStart, idx), lists, listId, level + 1))
      continue
    }
    // a deeper bullet with no parent item is demoted to this level
    items.push({type: 'listItem', content: bullet.lines.map(toParagraph)})
    idx++
  }
  return makeList(isOrderedList(lists, listId, level), items)
}

const convertBody = (
  content: docs_v1.Schema$StructuralElement[],
  lists: Lists
): TipTapContentNode[] => {
  const blocks: TipTapContentNode[] = []
  let pendingBullets: BulletParagraph[] = []
  let pendingListId = ''

  const flushBullets = () => {
    if (pendingBullets.length === 0) return
    blocks.push(buildList(pendingBullets, lists, pendingListId, 0))
    pendingBullets = []
    pendingListId = ''
  }

  for (const element of content) {
    const {paragraph, table} = element
    if (table) {
      flushBullets()
      for (const row of table.tableRows ?? []) {
        for (const cell of row.tableCells ?? []) {
          blocks.push(...convertBody(cell.content ?? [], lists))
        }
      }
      continue
    }
    if (!paragraph) continue
    const lines = getParagraphLines(paragraph)
    if (lines.length === 0) continue

    const listId = paragraph.bullet?.listId
    if (listId) {
      if (pendingBullets.length > 0 && listId !== pendingListId) flushBullets()
      pendingListId = listId
      pendingBullets.push({level: paragraph.bullet?.nestingLevel ?? 0, lines})
      continue
    }
    flushBullets()

    const level = HEADING_LEVELS[paragraph.paragraphStyle?.namedStyleType ?? '']
    if (level) {
      blocks.push({type: 'heading', attrs: {level}, content: lines.flat()})
      continue
    }
    blocks.push(...lines.map(toParagraph))
  }
  flushBullets()
  return blocks
}

const flattenTabs = (tabs: docs_v1.Schema$Tab[] | undefined): docs_v1.Schema$Tab[] =>
  (tabs ?? []).flatMap((tab) => [tab, ...flattenTabs(tab.childTabs)])

// Docs names untitled tabs "Tab 1", "Tab 2", …; those pages take the document title instead
const isDefaultTabTitle = (title: string | null | undefined) => !title || /^Tab \d+$/.test(title)

export const googleDocToPages = (doc: docs_v1.Schema$Document): TranscriptPageInput[] => {
  const tabs = flattenTabs(doc.tabs)
  const sources =
    tabs.length > 0
      ? tabs.map((tab) => ({
          title: tab.tabProperties?.title,
          content: tab.documentTab?.body?.content,
          lists: tab.documentTab?.lists
        }))
      : [{title: doc.title, content: doc.body?.content, lists: doc.lists}]

  const pages: TranscriptPageInput[] = []
  for (const source of sources) {
    const blocks = convertBody(source.content ?? [], source.lists ?? {})
    if (blocks.length === 0) continue
    const title =
      (isDefaultTabTitle(source.title) ? doc.title?.trim() : source.title?.trim()) || 'Notes'
    const content: TipTapSerializedPageContent = {
      type: 'doc',
      content: [{type: 'heading', attrs: {level: 1}, content: [textNode(title)]}, ...blocks]
    }
    pages.push({title, content})
  }
  return pages
}
