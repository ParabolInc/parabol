import type {JSONContent} from '@tiptap/core'
import type {FormattedExecutionResult} from 'graphql'
import {serverMarkdownManager} from '../../client/shared/tiptap/serverMarkdownManager'
import {Logger} from '../utils/Logger'

const tipTapContentToMarkdown = (content: string, fallback: string) => {
  try {
    const doc = JSON.parse(content) as JSONContent
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
