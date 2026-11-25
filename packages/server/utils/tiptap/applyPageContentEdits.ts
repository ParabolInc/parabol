import {TiptapTransformer} from '@hocuspocus/transformer'
import {getSchema, type JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import type * as Y from 'yjs'
import {getAllNodesAttributesByType} from '../../../client/shared/tiptap/getAllNodesAttributesByType'
import {parseMarkdownBlocks} from '../../../client/shared/tiptap/parseMarkdownBlocks'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import type {PageContentEditInput} from '../../graphql/public/resolverTypes'
import {assertReachablePageLinks} from './assertReachablePageLinks'
import {getPageMarkdownBlocks, PAGE_BLOCK_SEPARATOR} from './getPageMarkdownBlocks'
import {parsePageMarkdown} from './parsePageMarkdown'
import {toYXmlNodes} from './toYXmlNodes'

const schema = getSchema(serverTipTapExtensions)

const MAX_EDITS = 20
const MAX_EDIT_TEXT_LENGTH = 50_000
const MAX_PAGE_MARKDOWN_LENGTH = 1_000_000
const MAX_REWRITE_MARKDOWN_LENGTH = 100_000
const MAX_REWRITES = 500

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
  matchStarts: number[]
}

export const validatePageContentEdits = (edits: PageContentEditInput[]) => {
  if (edits.length === 0 || edits.length > MAX_EDITS) {
    throw new GraphQLError(`Provide between 1 and ${MAX_EDITS} edits`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (
    edits.some(
      ({oldText, newText}) =>
        oldText.length > MAX_EDIT_TEXT_LENGTH || newText.length > MAX_EDIT_TEXT_LENGTH
    )
  ) {
    throw new GraphQLError(
      `oldText and newText are limited to ${MAX_EDIT_TEXT_LENGTH} characters`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
}

const getOffsetsInsideEscapes = (text: string) =>
  new Set(
    [...text.matchAll(/&(?:amp|lt|gt);/g)].flatMap(({0: escape, index}) =>
      Array.from({length: escape.length - 1}, (_, offset) => index + 1 + offset)
    )
  )

const findMatchStarts = (text: string, search: string) => {
  const insideEscapes = getOffsetsInsideEscapes(text)
  const starts: number[] = []
  let start = text.indexOf(search)
  while (start !== -1) {
    const end = start + search.length
    if (insideEscapes.has(start) || insideEscapes.has(end)) {
      start = text.indexOf(search, start + 1)
    } else {
      starts.push(start)
      start = text.indexOf(search, end)
    }
  }
  return starts
}

const withoutSpacing = (value: string) => value.replace(/\s+/g, '')

const matchesIgnoringSpacing = (text: string, search: string) => {
  const compactSearch = withoutSpacing(search)
  return compactSearch.length > 0 && withoutSpacing(text).includes(compactSearch)
}

const getBlockStarts = (blocks: Block[]) => {
  let offset = 0
  return blocks.map(({markdown}) => {
    const start = offset
    offset += markdown.length + PAGE_BLOCK_SEPARATOR.length
    return start
  })
}

// A match rewrites only the blocks it shares a character with. One that covers only separators touches no block,
// and its replacement lands between blocks. Matches that share a block are rewritten together
const groupMatches = (blocks: Block[], matchStarts: number[], matchLength: number) => {
  const blockStarts = getBlockStarts(blocks)
  const groups: MatchGroup[] = []
  let firstIdx = 0
  for (const spanStart of matchStarts) {
    const spanEnd = spanStart + matchLength
    while (
      firstIdx < blocks.length &&
      blockStarts[firstIdx]! + blocks[firstIdx]!.markdown.length <= spanStart
    ) {
      firstIdx++
    }
    let nextIdx = firstIdx
    while (nextIdx < blocks.length && blockStarts[nextIdx]! < spanEnd) nextIdx++
    const lastIdx = nextIdx - 1
    const previous = groups.at(-1)
    if (previous && lastIdx >= firstIdx && firstIdx <= previous.lastIdx) {
      previous.lastIdx = Math.max(previous.lastIdx, lastIdx)
      previous.spanEnd = spanEnd
      previous.matchStarts.push(spanStart)
    } else {
      groups.push({firstIdx, lastIdx, spanStart, spanEnd, matchStarts: [spanStart]})
    }
  }
  return {groups, blockStarts}
}

const toBlocks = (nodes: JSONContent[]): Block[] =>
  getPageMarkdownBlocks(nodes).map((markdown, idx) => ({node: nodes[idx]!, markdown}))

const isSameNode = (left: JSONContent, right: JSONContent) =>
  schema.nodeFromJSON(left).eq(schema.nodeFromJSON(right))

// Blocks that serialize to nothing (a table of contents, a database) are invisible in the Markdown,
// so removing one is never what the caller meant. Others may be deleted, but are only rewritten if
// their Markdown parses back to exactly the same blocks
const findUnsafeRemoval = (removed: Block[], isRewrite: boolean) => {
  const original = removed.filter((block) => block.fragmentIndex !== undefined)
  const invisible = original.find(
    ({node, markdown}) => !markdown.trim() && !(node.type === 'paragraph' && !node.content?.length)
  )
  if (invisible || !isRewrite) return invisible
  const reparsed = parseMarkdownBlocks(
    original.map(({markdown}) => markdown).join(PAGE_BLOCK_SEPARATOR)
  )
  const visible = original.filter(({markdown}) => markdown.trim())
  if (reparsed.length !== visible.length) return visible[0]
  return visible.find(({node}, idx) => !isSameNode(node, reparsed[idx]!))
}

const collectCanonicalPageCodes = (nodes: JSONContent[]): number[] =>
  nodes.flatMap((node) => [
    ...(node.type === 'pageLinkBlock' && node.attrs?.canonical ? [node.attrs.pageCode] : []),
    ...collectCanonicalPageCodes(node.content ?? [])
  ])

const isSameCodes = (left: number[], right: number[]) => left.sort().join() === right.sort().join()

const rewriteGroup = (
  blocks: Block[],
  text: string,
  blockStarts: number[],
  {firstIdx, lastIdx, spanStart, spanEnd, matchStarts}: MatchGroup,
  {oldText, newText}: PageContentEditInput,
  canChangePageLinks: boolean,
  allowedImageSrcs: Set<string>
): Block[] => {
  const rangeStart = Math.min(spanStart, blockStarts[firstIdx] ?? spanStart)
  const lastBlock = blocks[lastIdx]
  const rangeEnd =
    lastIdx >= firstIdx && lastBlock
      ? Math.max(spanEnd, blockStarts[lastIdx]! + lastBlock.markdown.length)
      : spanEnd
  const replacement = matchStarts
    .map(
      (start, idx) => newText + text.slice(start + oldText.length, matchStarts[idx + 1] ?? spanEnd)
    )
    .join('')
  // Blank lines at the edges are separators that joining the blocks adds back, not empty paragraphs
  const rangeMarkdown = (
    text.slice(rangeStart, spanStart) +
    replacement +
    text.slice(spanEnd, rangeEnd)
  ).replace(/^\n+|\n+$/g, '')
  if (rangeMarkdown.length > MAX_REWRITE_MARKDOWN_LENGTH) {
    throw new GraphQLError(
      'The edit rewrites too much of the page at once. Split it into smaller edits',
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  const parsedNodes = parsePageMarkdown(rangeMarkdown, allowedImageSrcs)
  const oldBlocks = blocks.slice(firstIdx, lastIdx + 1)
  const newBlocks = toBlocks(parsedNodes)
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
  const unsafeBlock = findUnsafeRemoval(removed, created.length > 0)
  if (unsafeBlock) {
    throw new GraphQLError(
      `The edit would change a ${unsafeBlock.node.type} block that Markdown cannot fully represent. Leave it out of oldText, or use editPageContent with the json format`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (
    !canChangePageLinks &&
    !isSameCodes(
      collectCanonicalPageCodes(removed.map(({node}) => node)),
      collectCanonicalPageCodes(created.map(({node}) => node))
    )
  ) {
    throw new GraphQLError(
      'A token limited to specific pages cannot add or remove sub-page links',
      {extensions: {code: 'FORBIDDEN'}}
    )
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
  blocks: Block[],
  edit: PageContentEditInput,
  canChangePageLinks: boolean,
  rewriteBudget: number,
  allowedImageSrcs: Set<string>
) => {
  const {oldText, newText, replaceAll} = edit
  if (!oldText)
    throw new GraphQLError('oldText must not be empty', {extensions: {code: 'BAD_USER_INPUT'}})
  const text = blocks.map(({markdown}) => markdown).join(PAGE_BLOCK_SEPARATOR)
  const matchStarts = findMatchStarts(text, oldText)
  if (matchStarts.length === 0) {
    const message = text.includes(oldText)
      ? 'oldText matches the page only inside an escape such as &amp;, so include the whole escape'
      : matchesIgnoringSpacing(text, oldText)
        ? "oldText matches the page only if spacing is ignored, so copy it exactly from the page's markdown content"
        : 'oldText was not found in the page. Read the page content again and retry'
    throw new GraphQLError(message, {extensions: {code: 'CONFLICT'}})
  }
  if (matchStarts.length > 1 && !replaceAll) {
    throw new GraphQLError(
      `oldText appears ${matchStarts.length} times. Include more surrounding text to pick one, or set replaceAll`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (
    text.length + matchStarts.length * (newText.length - oldText.length) >
    MAX_PAGE_MARKDOWN_LENGTH
  ) {
    throw new GraphQLError('The page would be too long', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (oldText === newText) return {blocks, rewriteCount: 0}
  const {groups, blockStarts} = groupMatches(blocks, matchStarts, oldText.length)
  if (groups.length > rewriteBudget) {
    throw new GraphQLError(
      `The edits change more than ${MAX_REWRITES} places. Use editPageContent to rewrite the page`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  let nextBlocks = blocks
  // Right to left, so rewriting a group never moves the blocks or offsets of the groups before it
  for (const group of groups.reverse()) {
    nextBlocks = rewriteGroup(
      nextBlocks,
      text,
      blockStarts,
      group,
      edit,
      canChangePageLinks,
      allowedImageSrcs
    )
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
    throw new GraphQLError('Edited blocks did not convert to Yjs one-to-one', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
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
}

const isTitle = (node: JSONContent | undefined) =>
  node?.type === 'heading' && node.attrs?.level === 1

export const applyPageContentEdits = (
  doc: Y.Doc,
  edits: PageContentEditInput[],
  {
    canChangePageLinks,
    reachablePageCodes = []
  }: {canChangePageLinks: boolean; reachablePageCodes?: number[]}
) => {
  const nodes = (TiptapTransformer.fromYdoc(doc, 'default') as JSONContent).content ?? []
  if (nodes.length !== doc.getXmlFragment('default').length) {
    throw new GraphQLError('Page blocks do not match its Yjs fragment', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }
  let blocks: Block[] = toBlocks(nodes).map((block, fragmentIndex) => ({
    ...block,
    fragmentIndex
  }))
  const allowedImageSrcs = new Set(
    getAllNodesAttributesByType<{src?: unknown}>({content: nodes}, 'imageBlock')
      .map((attrs) => attrs?.src)
      .filter((src): src is string => typeof src === 'string')
  )
  let rewriteBudget = MAX_REWRITES
  for (const [idx, edit] of edits.entries()) {
    try {
      const result = applyEdit(blocks, edit, canChangePageLinks, rewriteBudget, allowedImageSrcs)
      blocks = result.blocks
      rewriteBudget -= result.rewriteCount
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e
      throw new GraphQLError(`Edit ${idx + 1}: ${e.message}`, {
        extensions: {code: e.extensions.code}
      })
    }
  }
  if (isTitle(nodes[0]) && !isTitle(blocks[0]?.node)) {
    throw new GraphQLError('The page must still start with its title as a level-1 heading', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (!canChangePageLinks) {
    assertReachablePageLinks(
      nodes,
      blocks.map(({node}) => node),
      reachablePageCodes
    )
  }
  const isUnchanged =
    blocks.length === nodes.length && blocks.every(({fragmentIndex}, idx) => fragmentIndex === idx)
  if (!isUnchanged) writeBlocks(doc, blocks)
}
