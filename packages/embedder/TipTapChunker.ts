import type {JSONContent} from '@tiptap/core'
import type {TipTapSerializedContent} from '../client/shared/tiptap/TipTapSerializedContent.d'
import {teamPromptSummaryTableHeaders} from '../server/graphql/mutations/helpers/summaryPage/teamPromptSummaryTableHeaders'
import {getSearchText} from './getSearchText'
import type {ISO6391} from './iso6393To1'

const TARGET_TOKENS = 384
const MAX_TOKENS = 512
const CHARS_PER_TOKEN = 3.7
const MAX_HEADING_CHARS = 100
const MIN_BUDGET_TOKENS = 64
const CJK_CHARACTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu
const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList'])
// a standup summary's table view repeats its response blocks
const RESPONSE_TABLE_HEADER = teamPromptSummaryTableHeaders.join(' | ')

export const estimateTokens = (text: string) => {
  const cjk = text.match(CJK_CHARACTER)?.length ?? 0
  return Math.ceil(cjk + (text.length - cjk) / CHARS_PER_TOKEN)
}

type BlockKind = 'table' | 'list' | 'text'

interface Block {
  kind: BlockKind
  text: string
}

interface Section {
  path: string[]
  blocks: Block[]
}

const headerOf = (title: string, path: string[]) =>
  [
    ...new Set(
      [title, ...path]
        .filter(Boolean)
        .map((heading) => Array.from(heading).slice(0, MAX_HEADING_CHARS).join(''))
    )
  ].join(' > ')

const pack = (pieces: string[], target: number) => {
  const groups: string[] = []
  let current = ''
  for (const piece of pieces) {
    const next = current ? `${current}\n${piece}` : piece
    if (current && estimateTokens(next) > target) {
      groups.push(current)
      current = piece
    } else {
      current = next
    }
  }
  if (current) groups.push(current)
  return groups
}

const kindOf = (type: string | undefined): BlockKind =>
  type === 'table' ? 'table' : type && LIST_TYPES.has(type) ? 'list' : 'text'

export class TipTapChunker {
  private language: ISO6391

  constructor(options?: {language?: ISO6391}) {
    this.language = options?.language ?? 'en'
  }

  private createSections(doc: TipTapSerializedContent) {
    const sections: Section[] = []
    const content = doc.content as JSONContent[]
    const hasResponses = content.some(({type}) => type === 'responseBlock')
    let title = ''
    let h1: string | undefined
    let path: string[] = []
    let current: Section | undefined
    const add = (kind: BlockKind, text: string) => {
      if (!text) return
      if (!current) {
        current = {path, blocks: []}
        sections.push(current)
      }
      current.blocks.push({kind, text})
    }
    for (const node of content) {
      if (node.type === 'heading') {
        const text = getSearchText(node)
        if (!text) continue
        if (!title) title = text
        const level = Number(node.attrs?.level ?? 1)
        if (level > 2) {
          add('text', text)
          continue
        }
        if (level === 1) h1 = text
        path = level === 1 || !h1 ? [text] : [h1, text]
        current = undefined
        continue
      }
      if (node.type === 'details') {
        if (hasResponses && getSearchText(node).split('\n').includes(RESPONSE_TABLE_HEADER))
          continue
        for (const part of node.content ?? []) {
          if (part.type === 'detailsSummary') add('text', getSearchText(part))
          else for (const child of part.content ?? []) add(kindOf(child.type), getSearchText(child))
        }
        continue
      }
      add(kindOf(node.type), getSearchText(node))
    }
    return {title, sections}
  }

  private segment(text: string, granularity: 'sentence' | 'word') {
    return Array.from(
      new Intl.Segmenter(this.language, {granularity}).segment(text),
      ({segment}) => segment
    )
  }

  private group(
    parts: string[],
    maxTokens: number,
    join: string,
    splitPart: (part: string) => string[]
  ): string[] {
    const groups: string[] = []
    let current = ''
    for (const part of parts) {
      if (estimateTokens(part) > maxTokens) {
        if (current.trim()) groups.push(current.trim())
        current = ''
        const smaller = splitPart(part)
        groups.push(
          ...(smaller.length > 1 ? this.group(smaller, maxTokens, '', splitPart) : [part])
        )
        continue
      }
      const next = current ? `${current}${join}${part}` : part
      if (current && estimateTokens(next) > maxTokens) {
        groups.push(current.trim())
        current = part
      } else {
        current = next
      }
    }
    if (current.trim()) groups.push(current.trim())
    return groups
  }

  private splitText(text: string, maxTokens: number): string[] {
    const splitSentence = (sentence: string) => {
      const words = this.segment(sentence, 'word')
      if (words.length > 1) return words
      const maxChars = Math.max(1, Math.floor(maxTokens))
      return Array.from(sentence.match(new RegExp(`[\\s\\S]{1,${maxChars}}`, 'gu')) ?? [])
    }
    return this.group(this.segment(text, 'sentence'), maxTokens, '', splitSentence)
  }

  private packLines(lines: string[], maxTokens: number) {
    const pieces = lines.flatMap((line) =>
      estimateTokens(line) > maxTokens ? this.splitText(line, maxTokens) : [line]
    )
    return pack(pieces, maxTokens).map((group) => group.trim())
  }

  private split({kind, text}: Block, maxTokens: number) {
    if (kind === 'text') return this.splitText(text, maxTokens)
    const lines = text.split('\n')
    const [header = '', ...rows] = lines
    if (kind === 'list' || estimateTokens(header) > maxTokens / 2) {
      return this.packLines(lines, maxTokens)
    }
    const rowBudget = maxTokens - estimateTokens(`${header}\n`)
    return this.packLines(rows, rowBudget).map((rowGroup) => `${header}\n${rowGroup}`)
  }

  private toChunk(title: string, headingPath: string[], text: string) {
    const header = headerOf(title, headingPath)
    const embeddingText = header ? `${header}\n\n${text}` : text
    return {
      globalTitle: title,
      headingPath,
      text,
      embeddingText,
      tokenCount: estimateTokens(embeddingText)
    }
  }

  chunk(doc: TipTapSerializedContent) {
    const {title, sections} = this.createSections(doc)
    if (sections.length === 0) return []
    const pageText = sections
      .flatMap(({path, blocks}) => [
        ...(path[0] === title ? path.slice(1) : path),
        ...blocks.map(({text}) => text)
      ])
      .join('\n')
    const singleChunk = this.toChunk(title, [], pageText)
    if (singleChunk.tokenCount <= MAX_TOKENS) return [singleChunk]
    return sections.flatMap(({path, blocks}) => {
      const header = headerOf(title, path)
      const target = Math.max(
        MIN_BUDGET_TOKENS,
        Math.min(TARGET_TOKENS, MAX_TOKENS - estimateTokens(`${header}\n\n`) - 1)
      )
      const pieces = blocks.flatMap((block) =>
        estimateTokens(block.text) <= target ? [block.text] : this.split(block, target)
      )
      return pack(pieces, target).map((text) => this.toChunk(title, path, text))
    })
  }
}
