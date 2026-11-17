import {TiptapTransformer} from '@hocuspocus/transformer'
import {Editor, type JSONContent} from '@tiptap/core'
import type {GraphQLErrorExtensions} from 'graphql'
import type * as Y from 'yjs'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import type {PageContentEditInput} from '../../graphql/public/resolverTypes'
import {toYXmlNodes} from './toYXmlNodes'

const BLOCK_SEPARATOR = '\n\n'
const MAX_PAGE_MARKDOWN_LENGTH = 1_000_000
const MAX_REWRITE_MARKDOWN_LENGTH = 100_000
const MAX_REWRITES = 500

interface PageContentEditError {
  code: NonNullable<GraphQLErrorExtensions['code']>
  message: string
}

interface Block {
  node: JSONContent
  markdown: string
  fragmentIndex?: number
}

interface MatchGroup {
  firstIdx: number
  lastIdx: number
  spanStart: number
  spanEnd: number
}

const findMatchStarts = (text: string, search: string) => {
  const starts: number[] = []
  let start = text.indexOf(search)
  while (start !== -1) {
    starts.push(start)
    start = text.indexOf(search, start + search.length)
  }
  return starts
}

const getBlockStarts = (blocks: Block[]) => {
  let offset = 0
  return blocks.map(({markdown}) => {
    const start = offset
    offset += markdown.length + BLOCK_SEPARATOR.length
    return start
  })
}

// A match rewrites only the blocks it shares a character with. One that covers only separators touches no block,
// and its replacement lands between blocks. Matches that share a block are rewritten together
const groupMatches = (blocks: Block[], matchStarts: number[], matchLength: number) => {
  const blockStarts = getBlockStarts(blocks)
  const groups: MatchGroup[] = []
  for (const spanStart of matchStarts) {
    const spanEnd = spanStart + matchLength
    const coveredIdxs = blocks.flatMap(({markdown}, idx) => {
      const blockStart = blockStarts[idx]!
      const blockEnd = blockStart + markdown.length
      const isCovered =
        markdown.length > 0
          ? blockStart < spanEnd && spanStart < blockEnd
          : spanStart < blockStart && blockEnd < spanEnd
      return isCovered ? [idx] : []
    })
    const firstCoveredIdx = coveredIdxs[0]
    const nextIdx = blockStarts.findIndex((start) => start >= spanEnd)
    const insertIdx = nextIdx === -1 ? blocks.length : nextIdx
    const firstIdx = firstCoveredIdx ?? insertIdx
    const lastIdx = coveredIdxs.at(-1) ?? insertIdx - 1
    const previous = groups.at(-1)
    if (previous && firstCoveredIdx !== undefined && firstIdx <= previous.lastIdx) {
      previous.lastIdx = Math.max(previous.lastIdx, lastIdx)
      previous.spanEnd = spanEnd
    } else {
      groups.push({firstIdx, lastIdx, spanStart, spanEnd})
    }
  }
  return {groups, blockStarts}
}

const parseMarkdown = (editor: Editor, markdown: string) => {
  if (!markdown.trim()) return []
  const doc = editor.schema.nodeFromJSON(editor.storage.markdown.manager.parse(markdown))
  doc.check()
  return (doc.toJSON() as JSONContent).content ?? []
}

const toBlock = (editor: Editor, node: JSONContent): Block => ({
  node,
  markdown: editor.storage.markdown.manager.serialize({type: 'doc', content: [node]})
})

const isSameNode = (editor: Editor, left: JSONContent, right: JSONContent) =>
  editor.schema.nodeFromJSON(left).eq(editor.schema.nodeFromJSON(right))

// Blocks that serialize to nothing (a table of contents, a database) are invisible in the Markdown,
// so removing one is never what the caller meant. Others may be deleted, but are only rewritten if
// their Markdown parses back to exactly the same blocks
const findUnsafeRemoval = (editor: Editor, removed: Block[], isRewrite: boolean) => {
  const original = removed.filter((block) => block.fragmentIndex !== undefined)
  const invisible = original.find(
    ({node, markdown}) => !markdown.trim() && !(node.type === 'paragraph' && !node.content?.length)
  )
  if (invisible || !isRewrite) return invisible
  const reparsed = parseMarkdown(
    editor,
    original.map(({markdown}) => markdown).join(BLOCK_SEPARATOR)
  )
  const visible = original.filter(({markdown}) => markdown.trim())
  if (reparsed.length !== visible.length) return visible[0]
  return visible.find(({node}, idx) => !isSameNode(editor, node, reparsed[idx]!))
}

const collectCanonicalPageCodes = (nodes: JSONContent[]): number[] =>
  nodes.flatMap((node) => [
    ...(node.type === 'pageLinkBlock' && node.attrs?.canonical ? [node.attrs.pageCode] : []),
    ...collectCanonicalPageCodes(node.content ?? [])
  ])

const isSameCodes = (left: number[], right: number[]) => left.sort().join() === right.sort().join()

const rewriteGroup = (
  editor: Editor,
  blocks: Block[],
  text: string,
  blockStarts: number[],
  {firstIdx, lastIdx, spanStart, spanEnd}: MatchGroup,
  {oldText, newText}: PageContentEditInput,
  canChangePageLinks: boolean
): Block[] | PageContentEditError => {
  const rangeStart = Math.min(spanStart, blockStarts[firstIdx] ?? spanStart)
  const lastBlock = blocks[lastIdx]
  const rangeEnd =
    lastIdx >= firstIdx && lastBlock
      ? Math.max(spanEnd, blockStarts[lastIdx]! + lastBlock.markdown.length)
      : spanEnd
  const replacement = text.slice(spanStart, spanEnd).split(oldText).join(newText)
  // Blank lines at the edges are separators that joining the blocks adds back, not empty paragraphs
  const rangeMarkdown = (
    text.slice(rangeStart, spanStart) +
    replacement +
    text.slice(spanEnd, rangeEnd)
  ).replace(/^\n+|\n+$/g, '')
  if (rangeMarkdown.length > MAX_REWRITE_MARKDOWN_LENGTH) {
    return {
      code: 'BAD_USER_INPUT',
      message: 'The edit rewrites too much of the page at once. Split it into smaller edits'
    }
  }
  let parsedNodes: JSONContent[]
  try {
    parsedNodes = parseMarkdown(editor, rangeMarkdown)
  } catch {
    return {code: 'BAD_USER_INPUT', message: 'newText could not be parsed as Markdown'}
  }
  const oldBlocks = blocks.slice(firstIdx, lastIdx + 1)
  const newBlocks = parsedNodes.map((node) => toBlock(editor, node))
  let keptPrefix = 0
  while (
    keptPrefix < oldBlocks.length &&
    keptPrefix < newBlocks.length &&
    oldBlocks[keptPrefix]!.markdown === newBlocks[keptPrefix]!.markdown
  ) {
    keptPrefix++
  }
  let keptSuffix = 0
  while (
    keptSuffix < oldBlocks.length - keptPrefix &&
    keptSuffix < newBlocks.length - keptPrefix &&
    oldBlocks.at(-1 - keptSuffix)!.markdown === newBlocks.at(-1 - keptSuffix)!.markdown
  ) {
    keptSuffix++
  }
  const removed = oldBlocks.slice(keptPrefix, oldBlocks.length - keptSuffix)
  const created = newBlocks.slice(keptPrefix, newBlocks.length - keptSuffix)
  const unsafeBlock = findUnsafeRemoval(editor, removed, created.length > 0)
  if (unsafeBlock) {
    return {
      code: 'BAD_USER_INPUT',
      message: `The edit would change a ${unsafeBlock.node.type} block that Markdown cannot fully represent. Leave it out of oldText, or use editPageContent with the json format`
    }
  }
  if (
    !canChangePageLinks &&
    !isSameCodes(
      collectCanonicalPageCodes(removed.map(({node}) => node)),
      collectCanonicalPageCodes(created.map(({node}) => node))
    )
  ) {
    return {
      code: 'FORBIDDEN',
      message: 'A token limited to specific pages cannot add or remove sub-page links'
    }
  }
  return [
    ...blocks.slice(0, firstIdx),
    ...oldBlocks.slice(0, keptPrefix),
    ...created,
    ...oldBlocks.slice(oldBlocks.length - keptSuffix),
    ...blocks.slice(lastIdx + 1)
  ]
}

const applyEdit = (
  editor: Editor,
  blocks: Block[],
  edit: PageContentEditInput,
  canChangePageLinks: boolean,
  rewriteBudget: number
): {blocks: Block[]; rewriteCount: number} | PageContentEditError => {
  const {oldText, newText, replaceAll} = edit
  if (!oldText) return {code: 'BAD_USER_INPUT', message: 'oldText must not be empty'}
  const text = blocks.map(({markdown}) => markdown).join(BLOCK_SEPARATOR)
  const matchStarts = findMatchStarts(text, oldText)
  if (matchStarts.length === 0) {
    return {
      code: 'CONFLICT',
      message: 'oldText was not found in the page. Read the page content again and retry'
    }
  }
  if (matchStarts.length > 1 && !replaceAll) {
    return {
      code: 'BAD_USER_INPUT',
      message: `oldText appears ${matchStarts.length} times. Include more surrounding text to pick one, or set replaceAll`
    }
  }
  if (
    text.length + matchStarts.length * (newText.length - oldText.length) >
    MAX_PAGE_MARKDOWN_LENGTH
  ) {
    return {code: 'BAD_USER_INPUT', message: 'The page would be too long'}
  }
  if (oldText === newText) return {blocks, rewriteCount: 0}
  const {groups, blockStarts} = groupMatches(blocks, matchStarts, oldText.length)
  if (groups.length > rewriteBudget) {
    return {
      code: 'BAD_USER_INPUT',
      message: `The edits change more than ${MAX_REWRITES} places. Use editPageContent to rewrite the page`
    }
  }
  let nextBlocks = blocks
  // Right to left, so rewriting a group never moves the blocks or offsets of the groups before it
  for (const group of groups.reverse()) {
    const result = rewriteGroup(
      editor,
      nextBlocks,
      text,
      blockStarts,
      group,
      edit,
      canChangePageLinks
    )
    if (!Array.isArray(result)) return result
    nextBlocks = result
  }
  return {blocks: nextBlocks, rewriteCount: groups.length}
}

const writeBlocks = (doc: Y.Doc, blocks: Block[]) => {
  const fragment = doc.getXmlFragment('default')
  const keptIndexes = new Set(blocks.map(({fragmentIndex}) => fragmentIndex))
  const createdNodes = blocks.filter(({fragmentIndex}) => fragmentIndex === undefined)
  const createdElements =
    createdNodes.length > 0 ? toYXmlNodes(createdNodes.map(({node}) => node)) : []
  if (createdElements.length !== createdNodes.length) {
    return {
      code: 'INTERNAL_SERVER_ERROR' as const,
      message: 'Edited blocks did not convert to Yjs one-to-one'
    }
  }
  doc.transact(() => {
    for (let idx = fragment.length - 1; idx >= 0; idx--) {
      if (!keptIndexes.has(idx)) fragment.delete(idx, 1)
    }
    let createdIdx = 0
    blocks.forEach(({fragmentIndex}, position) => {
      if (fragmentIndex !== undefined) return
      fragment.insert(position, [createdElements[createdIdx++]!.clone()])
    })
  })
  return null
}

const isTitle = (node: JSONContent | undefined) =>
  node?.type === 'heading' && node.attrs?.level === 1

export const applyPageContentEdits = (
  doc: Y.Doc,
  edits: PageContentEditInput[],
  {canChangePageLinks}: {canChangePageLinks: boolean}
): PageContentEditError | null => {
  const editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: [{type: 'paragraph'}]},
    extensions: serverTipTapExtensions
  })
  try {
    const nodes = (TiptapTransformer.fromYdoc(doc, 'default') as JSONContent).content ?? []
    if (nodes.length !== doc.getXmlFragment('default').length) {
      return {code: 'INTERNAL_SERVER_ERROR', message: 'Page blocks do not match its Yjs fragment'}
    }
    let blocks: Block[] = nodes.map((node, fragmentIndex) => ({
      ...toBlock(editor, node),
      fragmentIndex
    }))
    let rewriteBudget = MAX_REWRITES
    for (const [idx, edit] of edits.entries()) {
      const result = applyEdit(editor, blocks, edit, canChangePageLinks, rewriteBudget)
      if ('code' in result) return {...result, message: `Edit ${idx + 1}: ${result.message}`}
      blocks = result.blocks
      rewriteBudget -= result.rewriteCount
    }
    if (isTitle(nodes[0]) && !isTitle(blocks[0]?.node)) {
      return {
        code: 'BAD_USER_INPUT',
        message: 'The page must still start with its title as a level-1 heading'
      }
    }
    const isUnchanged =
      blocks.length === nodes.length &&
      blocks.every(({fragmentIndex}, idx) => fragmentIndex === idx)
    return isUnchanged ? null : writeBlocks(doc, blocks)
  } finally {
    editor.destroy()
  }
}
