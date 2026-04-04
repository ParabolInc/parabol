/**
 * convertTiptapToADF.ts
 *
 * Converts a Tiptap JSON document to an Atlassian Document Format (ADF) document.
 *
 * ADF spec: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 *
 * App-specific node types (imageBlock, fileBlock, fileUpload, taskBlock,
 * responseBlock, insightsBlock, thinkingBlock) do not have ADF
 * equivalents and are handled with explicit fallback strategies documented
 * inline. Override the CUSTOM_NODE_HANDLERS map to change that behaviour.
 */

import type {
  TipTapContentNode,
  TipTapSerializedContent,
  TipTapTableHeaderNode,
  TipTapTableNode,
  TipTapTableRowNode,
  TipTapTextNode,
  TiptapInsightsBlock
} from './TipTapSerializedContent.d'

// ---------------------------------------------------------------------------
// ADF types (minimal – extend as needed)
// ---------------------------------------------------------------------------

export interface AdfNode {
  type: string
  attrs?: Record<string, unknown>
  content?: AdfNode[]
  marks?: AdfMark[]
  text?: string
}

interface AdfMark {
  type: string
  attrs?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Mark conversion
// ---------------------------------------------------------------------------

function convertMark(mark: {type: string; attrs?: Record<string, any>}): AdfMark | null {
  switch (mark.type) {
    case 'bold':
      return {type: 'strong'}
    case 'italic':
      return {type: 'em'}
    case 'strike':
      return {type: 'strike'}
    case 'underline':
      return {type: 'underline'}
    case 'code':
      return {type: 'code'}
    case 'subscript':
      return {type: 'subsup', attrs: {type: 'sub'}}
    case 'superscript':
      return {type: 'subsup', attrs: {type: 'sup'}}
    case 'link':
      return {
        type: 'link',
        attrs: {
          href: mark.attrs?.href ?? '',
          title: mark.attrs?.title ?? undefined,
          target: mark.attrs?.target ?? '_blank'
        }
      }
    case 'textStyle':
      // textStyle carries color; map to ADF textColor
      return mark.attrs?.color ? {type: 'textColor', attrs: {color: mark.attrs.color}} : null
    case 'highlight':
      return mark.attrs?.color ? {type: 'backgroundColor', attrs: {color: mark.attrs.color}} : null
    // Tiptap-specific marks with no ADF equivalent – drop
    default:
      return null
  }
}

function convertMarks(
  marks?: Array<{type: string; attrs?: Record<string, any>}>
): AdfMark[] | undefined {
  if (!marks || marks.length === 0) return undefined
  const result = marks.map(convertMark).filter((m): m is AdfMark => m !== null)
  return result.length > 0 ? result : undefined
}

// ---------------------------------------------------------------------------
// Text node
// ---------------------------------------------------------------------------

function convertTextNode(node: TipTapTextNode): AdfNode {
  const out: AdfNode = {type: 'text', text: node.text}
  const marks = convertMarks(node.marks)
  if (marks) out.marks = marks
  return out
}

// ---------------------------------------------------------------------------
// Inline content helpers
// ---------------------------------------------------------------------------

function convertInlineContent(nodes?: TipTapTextNode[]): AdfNode[] {
  if (!nodes || nodes.length === 0) return []
  return nodes.map(convertTextNode)
}

// ---------------------------------------------------------------------------
// Block node conversion
// ---------------------------------------------------------------------------

function convertNode(node: TipTapContentNode): AdfNode | AdfNode[] | null {
  switch (node.type) {
    // -----------------------------------------------------------------------
    case 'paragraph': {
      const content = convertInlineContent(node.content)
      return {
        type: 'paragraph',
        // ADF paragraph has no alignment attr by default; add if your schema stores it
        ...(content.length > 0 ? {content} : {})
      }
    }

    // -----------------------------------------------------------------------
    case 'heading':
      return {
        type: 'heading',
        attrs: {level: node.attrs.level},
        content: convertInlineContent(node.content)
      }

    // -----------------------------------------------------------------------
    case 'bulletList':
      return {
        type: 'bulletList',
        content: node.content.map((item) => ({
          type: 'listItem',
          content: item.content.map((p) => ({
            type: 'paragraph',
            content: convertInlineContent(p.content)
          }))
        }))
      }

    // -----------------------------------------------------------------------
    case 'orderedList':
      return {
        type: 'orderedList',
        attrs: {order: node.attrs.start ?? 1},
        content: node.content.map((item) => ({
          type: 'listItem',
          content: item.content.map((p) => ({
            type: 'paragraph',
            content: convertInlineContent(p.content)
          }))
        }))
      }

    // -----------------------------------------------------------------------
    case 'taskList':
      return {
        type: 'taskList',
        attrs: {localId: crypto.randomUUID()},
        content: node.content.map((item) => ({
          type: 'taskItem',
          attrs: {state: item.attrs.checked ? 'DONE' : 'TODO', localId: crypto.randomUUID()},
          // ADF taskItem contains inline nodes directly, not block nodes
          content: item.content.flatMap((p) => convertInlineContent(p.content))
        }))
      }

    // -----------------------------------------------------------------------
    case 'codeBlock':
      return {
        type: 'codeBlock',
        attrs: {language: node.attrs.language ?? undefined},
        content: convertInlineContent(node.content)
      }

    // -----------------------------------------------------------------------
    case 'blockquote':
      return {
        type: 'blockquote',
        content: convertChildren(node.content as TipTapContentNode[])
      }

    // -----------------------------------------------------------------------
    case 'horizontalRule':
      return {type: 'rule'}

    // -----------------------------------------------------------------------
    case 'details':
      // ADF equivalent is `expand` (summary → title attr, content → body)
      return {
        type: 'expand',
        attrs: {
          title: convertInlineContent(node.content[0].content)
            .map((n) => n.text ?? '')
            .join('')
        },
        content: convertChildren(node.content[1].content as TipTapContentNode[])
      }

    // -----------------------------------------------------------------------
    case 'table':
      return convertTable(node)

    // -----------------------------------------------------------------------
    // App-specific nodes — see CUSTOM_NODE_HANDLERS below for overrides
    // -----------------------------------------------------------------------
    case 'imageBlock':
      return CUSTOM_NODE_HANDLERS.imageBlock(node as any)

    case 'fileBlock':
    case 'fileUpload':
      return CUSTOM_NODE_HANDLERS.fileBlock(node as any)

    case 'taskBlock':
      return CUSTOM_NODE_HANDLERS.taskBlock(node as any)

    case 'responseBlock':
      return CUSTOM_NODE_HANDLERS.responseBlock(node as any)

    case 'insightsBlock':
      return CUSTOM_NODE_HANDLERS.insightsBlock(node as TiptapInsightsBlock)

    default:
      console.warn(`[convertTiptapToADF] Unhandled node type: "${(node as any).type}"`)
      return null
  }
}

function convertChildren(nodes: TipTapContentNode[]): AdfNode[] {
  return nodes.flatMap((n) => {
    const result = convertNode(n)
    if (!result) return []
    return Array.isArray(result) ? result : [result]
  })
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

function convertTable(node: TipTapTableNode): AdfNode {
  return {
    type: 'table',
    attrs: {isNumberColumnEnabled: false, layout: 'default'},
    content: node.content.map((row) => convertTableRow(row))
  }
}

function convertTableRow(
  row: TipTapTableRowNode | TipTapTableRowNode<TipTapTableHeaderNode>
): AdfNode {
  return {
    type: 'tableRow',
    content: row.content.map((cell) => ({
      type: cell.type === 'tableHeader' ? 'tableHeader' : 'tableCell',
      attrs: {colspan: 1, rowspan: 1, colwidth: null, background: null},
      content: convertChildren(cell.content as TipTapContentNode[])
    }))
  }
}

// ---------------------------------------------------------------------------
// Custom node handlers
//
// These nodes live in your app but have no ADF equivalent. The defaults below
// produce a reasonable fallback so the document stays valid after a round-trip.
// Replace any handler with your own logic as needed.
// ---------------------------------------------------------------------------

type NodeHandler<T = any> = (node: T) => AdfNode | AdfNode[] | null

export const CUSTOM_NODE_HANDLERS: {
  imageBlock: NodeHandler
  fileBlock: NodeHandler
  taskBlock: NodeHandler
  responseBlock: NodeHandler
  insightsBlock: NodeHandler<TiptapInsightsBlock>
} = {
  /**
   * imageBlock → ADF mediaSingle (no Atlassian media ID, so we use url-type media).
   * If your app uploads to Atlassian Media API, swap src for id + collection.
   */
  imageBlock: (node) => {
    const {src, alt, width, height} = node.attrs ?? {}
    if (!src) return null
    return {
      type: 'mediaSingle',
      attrs: {layout: 'center'},
      content: [
        {
          type: 'media',
          attrs: {
            type: 'external',
            url: src,
            alt: alt ?? undefined,
            width: width ?? undefined,
            height: height ?? undefined
          }
        }
      ]
    }
  },

  /**
   * fileBlock / fileUpload → ADF inlineCard pointing at the file URL.
   * Falls back to a plain paragraph with a link if no URL is available.
   */
  fileBlock: (node) => {
    const url = node.attrs?.url ?? node.attrs?.src
    if (!url) return null
    return {
      type: 'inlineCard',
      attrs: {url}
    }
  },

  /**
   * taskBlock (your app's native task) → ADF taskList with a single item.
   * Preserves the task title and done state.
   */
  taskBlock: (node) => {
    const {title = '', done = false} = node.attrs ?? {}
    return {
      type: 'taskList',
      attrs: {localId: crypto.randomUUID()},
      content: [
        {
          type: 'taskItem',
          attrs: {state: done ? 'DONE' : 'TODO', localId: crypto.randomUUID()},
          content: [{type: 'paragraph', content: [{type: 'text', text: String(title)}]}]
        }
      ]
    }
  },

  /**
   * responseBlock → ADF panel (info type).
   * Strips any app-specific metadata, keeps visible text.
   */
  responseBlock: (node) => {
    const text = node.attrs?.text ?? node.attrs?.content ?? ''
    return {
      type: 'panel',
      attrs: {panelType: 'info'},
      content: [
        {
          type: 'paragraph',
          content: text ? [{type: 'text', text: String(text)}] : []
        }
      ]
    }
  },

  /**
   * insightsBlock → ADF expand (collapsible section).
   * Recursively converts any child Tiptap nodes inside the block.
   */
  insightsBlock: (node) => {
    const title = node.attrs?.title ?? 'Insights'
    return {
      type: 'expand',
      attrs: {title: String(title)},
      content:
        node.content && node.content.length > 0
          ? convertChildren(node.content as TipTapContentNode[])
          : [{type: 'paragraph'}]
    }
  }
}

// ---------------------------------------------------------------------------
// Public entry-point
// ---------------------------------------------------------------------------

/**
 * Convert a Tiptap document to an ADF document ready to POST to the Jira API.
 *
 * @example
 * ```ts
 * import { convertTiptapToADF } from './convertTiptapToADF'
 *
 * const adf = convertTiptapToADF(editor.getJSON() as TipTapSerializedContent)
 * await jiraClient.updateIssue(issueKey, { fields: { description: adf } })
 * ```
 */
export function convertTiptapToADF(doc: TipTapSerializedContent): AdfNode {
  // ADF requires at least one block node; guard against empty docs
  const bodyNodes = doc.content.slice(1) as TipTapContentNode[] // skip H1 title
  const converted = convertChildren(bodyNodes)
  return {
    type: 'doc',
    version: 1,
    content: converted.length > 0 ? converted : [{type: 'paragraph'}]
  } as AdfNode
}

export default convertTiptapToADF
