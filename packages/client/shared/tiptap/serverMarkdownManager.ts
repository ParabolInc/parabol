import {encodeHtmlEntities, type JSONContent} from '@tiptap/core'
import {MarkdownManager} from '@tiptap/markdown'
import {serverTipTapExtensions} from './serverTipTapExtensions'

const READ_AS_MARKUP = /&(?=#?[a-z0-9]+;)|<(?=[a-z/!?])|(?<=(?:^|\n)[ \t]*)>/iy

const isReadAsMarkup = (source: string, offset: number) => {
  READ_AS_MARKUP.lastIndex = offset
  return READ_AS_MARKUP.test(source)
}

const encodeHtmlEntitiesWhereNeeded = (text: string, followingText: string) => {
  const source = text + followingText
  return text.replace(/[&<>]/g, (char, offset: number) =>
    isReadAsMarkup(source, offset) ? encodeHtmlEntities(char) : char
  )
}

const getFollowingText = (node: JSONContent, parentNode?: JSONContent) => {
  const siblings = parentNode?.content ?? []
  const idx = siblings.indexOf(node)
  return idx === -1 ? '' : (siblings[idx + 1]?.text ?? '')
}

const markdownManager = new MarkdownManager({extensions: serverTipTapExtensions})
const codeTypes = markdownManager['codeTypes']
const escapeMarkdownSyntax = markdownManager['escapeMarkdownSyntax'].bind(markdownManager)

const isInCode = (node: JSONContent, parentNode?: JSONContent) =>
  [parentNode?.type, ...(node.marks ?? []).map(({type}) => type)].some(
    (type) => !!type && codeTypes.has(type)
  )

markdownManager['encodeTextForMarkdown'] = (
  text: string,
  node: JSONContent,
  parentNode?: JSONContent
) =>
  isInCode(node, parentNode)
    ? text
    : encodeHtmlEntitiesWhereNeeded(escapeMarkdownSyntax(text), getFollowingText(node, parentNode))

export const serverMarkdownManager = markdownManager
