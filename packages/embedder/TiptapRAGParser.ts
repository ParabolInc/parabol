import {Editor} from '@tiptap/core'
import {MarkdownManager} from '@tiptap/markdown'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {
  type TipTapSerializedContent,
  type TiptapContentNode
} from '../client/shared/tiptap/TipTapSerializedContent.d'

export class TiptapRAGParser {
  maxTokens: number
  editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: []},
    extensions: serverTipTapExtensions
  })
  constructor(maxTokens = 1024) {
    this.maxTokens = maxTokens
  }

  // Handler for different Tiptap nodes
  parseNode(node: TiptapContentNode): string {
    const markdown = this.editor.markdown as MarkdownManager
    return markdown.renderNodeToMarkdown(node)
  }
  generateChunks(doc: TipTapSerializedContent) {
    const chunks: ReturnType<typeof this.createChunk>[] = []
    let globalTitle = ''
    let currentHeadingPath: string[] = []
    let currentBuffer: string[] = []
    let currentTokenEstimate = 0

    for (const node of doc.content) {
      // 1. Update Breadcrumbs & Global Title
      if (node.type === 'heading') {
        const text = node.content[0]?.text
        if (!text) return
        if (!globalTitle && node.attrs.level === 1) {
          globalTitle = text
        }

        // Update path: e.g., Level 2 clears everything after index 1
        currentHeadingPath[node.attrs.level - 1] = text
        currentHeadingPath = currentHeadingPath.slice(0, node.attrs.level)
        continue // Don't add headings to buffer yet, they are metadata
      }

      const nodeMarkdown = this.parseNode(node)
      const tokenCount = Math.ceil(nodeMarkdown.length / 4) // Rough estimate

      // 2. Check if we need to flush the buffer
      if (currentTokenEstimate + tokenCount > this.maxTokens && currentBuffer.length > 0) {
        chunks.push(this.createChunk(globalTitle, currentHeadingPath, currentBuffer))
        currentBuffer = []
        currentTokenEstimate = 0
      }

      currentBuffer.push(nodeMarkdown)
      currentTokenEstimate += tokenCount
    }

    // Final flush
    if (currentBuffer.length > 0) {
      chunks.push(this.createChunk(globalTitle, currentHeadingPath, currentBuffer))
    }

    return chunks
  }

  createChunk(globalTitle: string, headings: string[], buffer: string[]) {
    const text = buffer.join('\n\n')
    return {
      globalTitle,
      headingPath: [...headings],
      text,
      // The text actually sent to Qwen3 embedding
      embeddingInput: `Title: ${globalTitle}\nSection: ${headings.join(' > ')}\n\n${text}`
    }
  }
}
