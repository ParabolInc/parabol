import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'

// every node type the Confluence serializer explicitly emits, incl. child node types
// handled inside parent emitters (taskItem, table cells, details sections)
const HANDLED_NODES = new Set([
  'doc',
  'text',
  'hardBreak',
  'mention',
  'pageUserMention',
  'taskTag',
  'popoverMention',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'details',
  'detailsSummary',
  'detailsContent',
  'imageBlock',
  'imageUpload',
  'fileBlock',
  'fileUpload',
  'loom',
  'pageLinkBlock',
  'insightsBlock',
  'taskBlock',
  'responseBlock',
  'thinkingBlock',
  // database pages take the convertDatabasePageToStorage path (static table snapshot)
  'database'
])

// marks the serializer maps to storage-format tags (or deliberately degrades)
const HANDLED_MARKS = new Set([
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'link',
  'textStyle',
  'highlight',
  'searchResult'
])

describe('Confluence serializer coverage', () => {
  it('accounts for every editor node type — add a handler or a degradation before shipping a new node', () => {
    const nodeNames = serverTipTapExtensions
      .filter((ext) => ext.type === 'node')
      .map((ext) => ext.name)
    const unhandled = nodeNames.filter((name) => !HANDLED_NODES.has(name))
    // unknown nodes degrade to plain text with a census entry at runtime, but a NEW editor
    // node should be a conscious decision: add an emitter (or accept degradation) in
    // convertTipTapToConfluenceStorage.ts, then add the name here
    expect(unhandled).toEqual([])
  })

  it('accounts for every editor mark type', () => {
    const markNames = serverTipTapExtensions
      .filter((ext) => ext.type === 'mark')
      .map((ext) => ext.name)
    const unhandled = markNames.filter((name) => !HANDLED_MARKS.has(name))
    expect(unhandled).toEqual([])
  })
})
