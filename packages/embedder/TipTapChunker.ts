import {Editor} from '@tiptap/core'
import {MarkdownManager} from '@tiptap/markdown'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {
  type TipTapContentNode,
  type TipTapSerializedContent,
  type TipTapTableRowNode
} from '../client/shared/tiptap/TipTapSerializedContent.d'
import type {ISO6391} from './iso6393To1'

interface ParagraphFragment {
  text: string
  tokenCount: number
}
interface HeadingSection extends ParagraphFragment {
  headingPath: string[]
}

interface SemanticChunk extends HeadingSection {
  globalTitle: string
  embeddingText: string
}

interface Options {
  modelMaxTokens?: number
  maxTokens?: number
  minTokens?: number
  minTokenOverlap?: number
  maxTokenOverlap?: number
  language?: ISO6391
}

// This chunker is a hierarchical, recursive character chunker with a sliding window
// Every TipTap node is treated as an atomic block.
// If a single block exceeds the chunk size (e.g. large table or paragraph),
// it breaks those into smaller segments (for tables it repeats the heading row, for paragraphs it uses a sliding window).
// The atomic blocks are assigned to the heading that they are under, defaulting to the H1 Title.
// Multiple heading sections are grouped together into a chunk that is between minTokens and maxTokens.
// `minTokens` prevents orphaned sections from being greedily packed, which would water down the semantic meaning
export class TipTapChunker {
  // The max tokens supported by the model. maxTokens is to ensure semantic similarity in the chunk
  // But if that is guaranteed (i.e. the node in question is a large table) then we use the modelMaxTokens instead
  private modelMaxTokens: number

  // the maximum number of tokens a chunk can have
  private maxTokens: number
  // If a chunk has more than minTokens, don't add another block to it if that risks decreasing the semantic similarity
  private minTokens: number
  // Attempted size of the overlap for the sliding window
  private minTokenOverlap: number
  // This probably shouldn't exceed 50% of the maxTokens, otherwise we risk chunks repeating a lot of the same data
  private maxTokenOverlap: number
  private language: ISO6391
  private globalTitle = ''
  private editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: []},
    extensions: serverTipTapExtensions
  })
  constructor(options?: Options) {
    this.modelMaxTokens = options?.modelMaxTokens ?? 32768
    this.maxTokens = options?.maxTokens ?? 1024
    this.minTokens = options?.minTokens ?? this.maxTokens * 0.75
    this.minTokenOverlap = options?.minTokenOverlap ?? this.maxTokens * 0.125
    this.maxTokenOverlap = options?.maxTokenOverlap ?? this.maxTokens * 0.5
    this.language = options?.language ?? 'en'
  }

  private nodeToMarkdown(node: TipTapContentNode | TipTapTableRowNode<any>): string {
    const markdown = this.editor.markdown as MarkdownManager
    return markdown.renderNodeToMarkdown(node)
  }

  private estimateTokens(text: string) {
    // Qwen3 has such a large context window that if we're off by even 50% it doesn't really matter
    // Speed is more important here
    return text.length / 4
  }

  // If a single paragraph is too big, break it apart
  private fragmentParagraph(
    text: string,
    granularity: NonNullable<Intl.SegmenterOptions['granularity']>
  ): ParagraphFragment[] {
    const segmenter = new Intl.Segmenter(this.language, {granularity})
    const segments = Array.from(segmenter.segment(text)).map((s) => s.segment)
    const fragments: ParagraphFragment[] = []

    for (const segment of segments) {
      const tokenCount = this.estimateTokens(segment)
      if (tokenCount <= this.maxTokens) {
        fragments.push({text: segment, tokenCount})
      } else if (granularity === 'grapheme') {
        throw new Error(`Grapheme is too long. This should never happen: ${segment}`)
      } else {
        const nextGranularity = granularity === 'sentence' ? 'word' : 'grapheme'
        fragments.push(...this.fragmentParagraph(segment, nextGranularity))
      }
    }
    return fragments
  }

  private greedyPackFragments(fragments: ParagraphFragment[]) {
    const packedFragments: ParagraphFragment[] = []
    let currentBin: ParagraphFragment[] = []
    let currentBinTokens = 0
    for (let i = 0; i < fragments.length; i++) {
      const segment = fragments[i]!
      const {tokenCount} = segment

      if (currentBinTokens + tokenCount <= this.maxTokens) {
        currentBin.push(segment)
        currentBinTokens += tokenCount
      } else {
        // Finalize the cluster
        const binText = currentBin.map(({text}) => text).join('')
        packedFragments.push({text: binText, tokenCount: currentBinTokens})

        // start the next cluster with the end of this cluster
        const overlapSeed = this.getOverlapSeed(currentBin)
        currentBin = [overlapSeed]
        currentBinTokens = overlapSeed.tokenCount
      }
    }
    const binText = currentBin.map(({text}) => text).join('')
    if (currentBin.length > 0) packedFragments.push({text: binText, tokenCount: currentBinTokens})
    return packedFragments
  }

  private getOverlapSeed(fragments: ParagraphFragment[]) {
    const overlapSegments: ParagraphFragment[] = []
    let overlapSum = 0

    // Traverse the current fragments backwards to grab enough sentences for the overlap
    for (let i = fragments.length - 1; i >= 0; i--) {
      if (overlapSum >= this.minTokenOverlap) break
      const fragment = fragments[i]!
      const {tokenCount, text} = fragment
      if (overlapSum + tokenCount > this.maxTokenOverlap) {
        // if prefixing with this next fragment would make the overlap seed obscenely large
        // and we haven't hit a minimum yet, break it apart
        const minTokensNeeded = this.minTokenOverlap - overlapSum
        const maxTokensNeeded = this.maxTokenOverlap - overlapSum
        const seedBin: string[] = []
        const seedFragment = this.fragmentParagraph(text, 'word')
        let seedLength = 0
        for (let j = seedFragment.length - 1; j >= 0; j--) {
          const seedSegment = seedFragment[j]!
          // if the next word is silly long & would push us over our max, stop
          // we'd rather have nothing than a part of a very long word
          if (seedSegment.tokenCount + seedLength >= maxTokensNeeded) break
          seedBin.unshift(seedSegment.text)
          seedLength += seedSegment.tokenCount
          if (seedLength > minTokensNeeded) break
        }
        if (seedLength > 0) {
          overlapSegments.unshift({text: seedBin.join(''), tokenCount: seedLength})
          overlapSum += seedLength
        }
        break
      } else {
        overlapSum += tokenCount
        overlapSegments.unshift(fragment)
      }
    }
    const overlapSeed = overlapSegments.map(({text}) => text).join('')
    return {text: overlapSeed, tokenCount: overlapSum}
  }

  private generateFragments(text: string) {
    const fragments = this.fragmentParagraph(text, 'sentence')
    return this.greedyPackFragments(fragments)
  }

  private createSections(doc: TipTapSerializedContent) {
    const sections: HeadingSection[] = []
    let currentPath: string[] = []
    const {content} = doc
    content.forEach((node) => {
      if (node.type === 'heading') {
        const headingText = node.content[0]?.text.trim().slice(0, 500)
        if (!headingText) return
        if (!this.globalTitle) {
          this.globalTitle = headingText
        }
        currentPath[node.attrs.level - 1] = headingText
        // if going from h3 to h2, remove the h3
        currentPath = currentPath.slice(0, node.attrs.level)
        return
      }
      const markdownText = this.nodeToMarkdown(node).slice(0, this.modelMaxTokens)
      const tokenCount = this.estimateTokens(markdownText)
      if (tokenCount > this.maxTokens && node.type !== 'table') {
        // Edge case: a single paragraph is too large. Break it up with a sliding window
        const fragments = this.generateFragments(markdownText)
        fragments.forEach((fragment) => {
          sections.push({
            text: fragment.text,
            tokenCount: fragment.tokenCount,
            headingPath: [...currentPath]
          })
        })
      } else {
        // TipTap doesn't have a TableRow serializer, only a table serializer
        // Large tables need the table header repeated in each chunk in order to provide context
        // This would be a lot of work, so instead we just put the whole table in 1 chunk max
        // This probably works out better anyways, since a table is homogenous data
        sections.push({text: markdownText, tokenCount, headingPath: [...currentPath]})
      }
    })
    return sections
  }

  private isMajorBoundary(a: HeadingSection, b: HeadingSection) {
    // Check if H1 or H2 changed. Changes at H3 are ignored for "Greediness"
    return a.headingPath[0] !== b.headingPath[0] || a.headingPath[1] !== b.headingPath[1]
  }

  private greedyPackSections(sections: HeadingSection[]): SemanticChunk[] {
    const chunks: SemanticChunk[] = []
    let currentBin: HeadingSection[] = []
    let currentBinTokens = 0

    for (let i = 0; i < sections.length; i++) {
      const current = sections[i]!
      const next = sections[i + 1]

      if (currentBinTokens + current.tokenCount <= this.maxTokens) {
        currentBin.push(current)
        currentBinTokens += current.tokenCount
      } else {
        chunks.push(this.finalizeChunk(currentBin))
        currentBin = [current]
        currentBinTokens = current.tokenCount
      }

      if (next && this.isMajorBoundary(current, next)) {
        if (currentBinTokens > this.minTokens) {
          chunks.push(this.finalizeChunk(currentBin))
          currentBin = []
          currentBinTokens = 0
        }
      }
    }

    if (currentBin.length > 0) chunks.push(this.finalizeChunk(currentBin))
    return chunks
  }

  private finalizeChunk(sections: HeadingSection[]) {
    const text = sections
      .filter(({text}) => text)
      .map(({text}) => text)
      .join('\n\n')
    // aggregate the headings associated with this chunk
    const headingPath = [...new Set(sections.flatMap(({headingPath}) => headingPath))]
    const sectionStr = [...new Set(sections.map(({headingPath}) => headingPath.join(' > ')))].join(
      '\n'
    )
    return {
      globalTitle: this.globalTitle,
      headingPath,
      text,
      embeddingText: `Title: ${this.globalTitle}\nSections: ${sectionStr}\n\n${text}`,
      tokenCount: sections.reduce((s, b) => s + b.tokenCount, 0)
    }
  }
  chunk(doc: TipTapSerializedContent) {
    const sections = this.createSections(doc)
    return this.greedyPackSections(sections)
  }
}
