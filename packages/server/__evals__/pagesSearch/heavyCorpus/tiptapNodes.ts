import type {JSONContent} from '@tiptap/core'

type Inline = string | JSONContent

const toInline = (part: Inline): JSONContent =>
  typeof part === 'string' ? {type: 'text', text: part} : part

export const hardBreak: JSONContent = {type: 'hardBreak'}

export const paragraph = (...parts: Inline[]): JSONContent =>
  parts.length === 0 ? {type: 'paragraph'} : {type: 'paragraph', content: parts.map(toInline)}

export const heading = (level: number, text: string): JSONContent => ({
  type: 'heading',
  attrs: {level},
  content: [toInline(text)]
})

export const bulletList = (items: JSONContent[]): JSONContent => ({
  type: 'bulletList',
  content: items.map((item) => ({type: 'listItem', content: [item]}))
})

export const orderedList = (items: string[]): JSONContent => ({
  type: 'orderedList',
  attrs: {start: 1},
  content: items.map((item) => ({type: 'listItem', content: [paragraph(item)]}))
})

const tableCell = (type: 'tableHeader' | 'tableCell', text: string): JSONContent => ({
  type,
  attrs: {colspan: 1, rowspan: 1},
  content: [text ? paragraph(text) : paragraph()]
})

export const table = (header: string[], rows: string[][]): JSONContent => ({
  type: 'table',
  content: [
    {type: 'tableRow', content: header.map((text) => tableCell('tableHeader', text))},
    ...rows.map((row) => ({
      type: 'tableRow',
      content: row.map((text) => tableCell('tableCell', text))
    }))
  ]
})

export const tableView = (header: string[], rows: string[][]): JSONContent => ({
  type: 'details',
  attrs: {open: false},
  content: [
    {type: 'detailsSummary', content: [toInline('Table View')]},
    {type: 'detailsContent', content: [table(header, rows)]}
  ]
})

export const responseBlock = (attrs: {
  id: string
  preferredName: string
  avatar: string
  content: JSONContent
}): JSONContent => ({
  type: 'responseBlock',
  attrs: {...attrs, content: JSON.stringify(attrs.content)}
})

export const taskBlock = (attrs: {
  id: string
  preferredName: string
  avatar: string
  text: string
}): JSONContent => ({
  type: 'taskBlock',
  attrs: {
    id: attrs.id,
    status: 'active',
    preferredName: attrs.preferredName,
    avatar: attrs.avatar,
    content: JSON.stringify({type: 'doc', content: [paragraph(attrs.text)]}),
    service: null
  }
})

export const insightsBlock = (
  attrs: {
    id: string
    teamIds: string[]
    meetingTypes: string[]
    after: string
    before: string
    meetingIds: string[]
    hash: string
    prompt: string
  },
  content: JSONContent[]
): JSONContent => ({
  type: 'insightsBlock',
  attrs: {...attrs, editing: false, title: 'Top Topics', error: null},
  content
})

export const pageLinkBlock = (pageCode: number, title: string): JSONContent => ({
  type: 'pageLinkBlock',
  attrs: {pageCode, title, canonical: true}
})
