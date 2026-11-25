import type {JSONContent} from '@tiptap/core'
import type {FormattedExecutionResult} from 'graphql'
import {serverMarkdownManager} from '../../client/shared/tiptap/serverMarkdownManager'
import {Logger} from '../utils/Logger'

const INLINE_NODE_TEXT: Record<string, (attrs: Record<string, unknown>) => string> = {
  mention: ({label}) => String(label ?? ''),
  popoverMention: ({label}) => String(label ?? ''),
  pageUserMention: ({label}) => (label ? `@${label}` : ''),
  taskTag: ({id}) => (id ? `#${id}` : '')
}

const toVisibleText = (node: JSONContent): JSONContent[] => {
  const getText = node.type ? INLINE_NODE_TEXT[node.type] : undefined
  if (getText) {
    const text = getText(node.attrs ?? {})
    return text ? [{type: 'text', text, ...(node.marks && {marks: node.marks})}] : []
  }
  return [node.content ? {...node, content: node.content.flatMap(toVisibleText)} : node]
}

const tipTapContentToMarkdown = (content: string, fallback: string) => {
  try {
    const [doc] = toVisibleText(JSON.parse(content) as JSONContent)
    if (!doc) return fallback
    return serverMarkdownManager.serialize(doc).replace(/^\n+|\n+$/g, '') || fallback
  } catch (e) {
    Logger.warn(`Saved content could not be written as markdown: ${(e as Error).message}`)
    return fallback
  }
}

type JSONRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JSONRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const convertValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(convertValue)
  return isRecord(value) ? convertRecord(value) : value
}

const convertRecord = (record: JSONRecord): JSONRecord => {
  const converted = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, convertValue(value)])
  )
  const {content, plaintextContent, ...rest} = converted
  if (typeof content !== 'string' || typeof plaintextContent !== 'string') return converted
  return {...rest, content: tipTapContentToMarkdown(content, plaintextContent)}
}

export const withMarkdownContent = (result: FormattedExecutionResult): FormattedExecutionResult =>
  result.data ? {...result, data: convertRecord(result.data)} : result

export default tipTapContentToMarkdown
