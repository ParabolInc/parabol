/**
 * convertADFToTipTap.ts
 *
 * Converts an Atlassian Document Format (ADF) document to a Tiptap JSON
 * document that conforms to the app's TipTapSerializedContent schema.
 *
 * ADF spec: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 */

import type {
  TipTapContentNode,
  TipTapSerializedContent,
  TipTapTextNode
} from './TipTapSerializedContent.d'

// ---------------------------------------------------------------------------
// ADF input types
// ---------------------------------------------------------------------------

export interface AdfNode {
  type: string
  version?: number
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
// Output types — narrowed aliases of your schema
// ---------------------------------------------------------------------------

type TiptapMark = NonNullable<TipTapTextNode['marks']>[number]

// ---------------------------------------------------------------------------
// Mark transformer
// ---------------------------------------------------------------------------

function transformMark(mark: AdfMark): TiptapMark | null {
  switch (mark.type) {
    case 'strong':
      return {type: 'bold'}
    case 'em':
      return {type: 'italic'}
    case 'strike':
      return {type: 'strike'}
    case 'underline':
      return {type: 'underline'}
    case 'code':
      return {type: 'code'}
    case 'subsup':
      return {type: mark.attrs?.type === 'sub' ? 'subscript' : 'superscript'}
    case 'link':
      return {
        type: 'link',
        attrs: {
          href: mark.attrs?.href ?? null,
          title: mark.attrs?.title ?? null,
          target: mark.attrs?.target ?? '_blank'
        }
      }
    case 'textColor':
      return {type: 'textStyle', attrs: {color: mark.attrs?.color ?? null}}
    case 'backgroundColor':
      return {type: 'highlight', attrs: {color: mark.attrs?.color ?? null}}
    // Unknown marks — drop silently
    default:
      return null
  }
}

function transformMarks(marks?: AdfMark[]): TiptapMark[] | undefined {
  if (!marks || marks.length === 0) return undefined
  const result = marks.map(transformMark).filter((m): m is TiptapMark => m !== null)
  return result.length > 0 ? result : undefined
}

// ---------------------------------------------------------------------------
// Text node
// ---------------------------------------------------------------------------

function transformTextNode(node: AdfNode): TipTapTextNode {
  const out: TipTapTextNode = {type: 'text', text: node.text ?? ''}
  const marks = transformMarks(node.marks)
  if (marks) out.marks = marks
  return out
}

// ---------------------------------------------------------------------------
// Inline content — only text nodes are valid inside paragraphs/headings
// ---------------------------------------------------------------------------

function transformInlineContent(nodes?: AdfNode[]): TipTapTextNode[] {
  if (!nodes) return []
  return nodes.flatMap((n): TipTapTextNode[] => {
    switch (n.type) {
      case 'text':
        return [transformTextNode(n)]
      case 'hardBreak':
        // Represent a hard break as a newline character in a text node so it
        // survives inside paragraph/heading content without needing a custom node.
        return [{type: 'text', text: '\n'}]
      case 'emoji':
        return [{type: 'text', text: (n.attrs?.text ?? n.attrs?.shortName ?? '') as string}]
      case 'mention':
        // Render mention as plain @-text; swap for a mention extension if you add one.
        return [
          {type: 'text', text: (n.attrs?.text ?? n.attrs?.displayName ?? '@mention') as string}
        ]
      case 'inlineCard':
        // Smart link → plain linked text
        return [
          {
            type: 'text',
            text: (n.attrs?.url ?? '') as string,
            marks: [{type: 'link', attrs: {href: n.attrs?.url ?? null}}]
          }
        ]
      default:
        return []
    }
  })
}

// ---------------------------------------------------------------------------
// Block node transformer
// ---------------------------------------------------------------------------

function transformNode(node: AdfNode): TipTapContentNode | TipTapContentNode[] | null {
  switch (node.type) {
    // -------------------------------------------------------------------------
    case 'paragraph':
      return {
        type: 'paragraph',
        content: transformInlineContent(node.content) as [TipTapTextNode, ...TipTapTextNode[]]
      }

    // -------------------------------------------------------------------------
    case 'heading': {
      const level = ((node.attrs?.level as number) ?? 1) as 1 | 2 | 3 | 4 | 5 | 6
      return {
        type: 'heading',
        attrs: {level},
        content: transformInlineContent(node.content)
      }
    }

    // -------------------------------------------------------------------------
    case 'bulletList':
      return {
        type: 'bulletList',
        attrs: {tight: false},
        content: (node.content ?? []).map((item) => ({
          type: 'listItem' as const,
          content: transformListItemContent(item.content)
        })) as any
      }

    // -------------------------------------------------------------------------
    case 'orderedList':
      return {
        type: 'orderedList',
        attrs: {start: (node.attrs?.order as number) ?? 1, tight: false, type: null},
        content: (node.content ?? []).map((item) => ({
          type: 'listItem' as const,
          content: transformListItemContent(item.content)
        })) as any
      }

    // -------------------------------------------------------------------------
    case 'taskList':
      return {
        type: 'taskList',
        content: (node.content ?? []).map((item) => ({
          type: 'taskItem' as const,
          attrs: {checked: item.attrs?.state === 'DONE'},
          content: transformListItemContent(item.content)
        })) as any
      }

    // -------------------------------------------------------------------------
    case 'blockquote':
      return {
        type: 'blockquote',
        content: transformChildren(node.content)
      }

    // -------------------------------------------------------------------------
    case 'codeBlock':
      return {
        type: 'codeBlock',
        attrs: {language: (node.attrs?.language as string) ?? null},
        content: transformInlineContent(node.content)
      }

    // -------------------------------------------------------------------------
    case 'rule':
      return {type: 'horizontalRule'}

    // -------------------------------------------------------------------------
    // Tables
    // -------------------------------------------------------------------------
    case 'table':
      return {
        type: 'table',
        content: (node.content ?? []).map((row) => ({
          type: 'tableRow' as const,
          content: (row.content ?? []).map((cell) => ({
            type: (cell.type === 'tableHeader' ? 'tableHeader' : 'tableCell') as
              | 'tableHeader'
              | 'tableCell',
            content: transformChildren(cell.content)
          }))
        })) as any
      }
    // -------------------------------------------------------------------------
    // expand / nestedExpand → details
    //
    // ADF expand has a plain-text `title` attr; map it to detailsSummary.
    // -------------------------------------------------------------------------
    case 'expand':
    case 'nestedExpand':
      return {
        type: 'details',
        attrs: {open: false},
        content: [
          {
            type: 'detailsSummary',
            content: node.attrs?.title ? [{type: 'text', text: node.attrs.title as string}] : []
          },
          {
            type: 'detailsContent',
            content: transformChildren(node.content)
          }
        ]
      }

    // -------------------------------------------------------------------------
    // panel → blockquote
    //
    // ADF panels (info/warning/error/success/note) have no direct equivalent in
    // your schema. blockquote is the closest semantic container. If you add a
    // callout/panel extension later, swap this out.
    // -------------------------------------------------------------------------
    case 'panel':
      return {
        type: 'blockquote',
        content: transformChildren(node.content)
      }

    // -------------------------------------------------------------------------
    // Inline nodes at block level (technically invalid ADF, but happens in the
    // wild) — wrap in a paragraph so the doc stays valid.
    // -------------------------------------------------------------------------
    case 'text':
      return {
        type: 'paragraph',
        content: [transformTextNode(node)]
      }

    case 'hardBreak':
      return null // only meaningful inside inline content; drop at block level
    case 'mediaSingle':
    case 'media':
    case 'mediaGroup':
    case 'blockCard':
    case 'embedCard':
    default:
      throw new Error(`[convertADFToTipTap] Unsupported ADF node type: "${node.type}"`)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Transforms a list of ADF child nodes into TipTapContentNodes, flattening
 * any nodes that expand to multiple outputs (e.g. mediaGroup).
 */
function transformChildren(nodes?: AdfNode[]): TipTapContentNode[] {
  if (!nodes) return []
  return nodes.flatMap((n) => {
    const result = transformNode(n)
    if (!result) return []
    return Array.isArray(result) ? result : [result]
  })
}

/**
 * ADF listItem content can be paragraphs, nested lists, codeBlocks, etc.
 * Your listItem schema only allows TipTapParagraphNode[], so we coerce
 * everything to paragraphs to stay schema-valid.
 */
function transformListItemContent(
  nodes?: AdfNode[]
): {type: 'paragraph'; content: TipTapTextNode[]}[] {
  if (!nodes) return [{type: 'paragraph', content: []}]

  const result: {type: 'paragraph'; content: TipTapTextNode[]}[] = []

  for (const node of nodes) {
    if (node.type === 'paragraph') {
      result.push({type: 'paragraph', content: transformInlineContent(node.content)})
    } else if (
      node.type === 'bulletList' ||
      node.type === 'orderedList' ||
      node.type === 'taskList'
    ) {
      // Nested lists aren't valid inside your listItem schema — flatten their
      // text content into indented paragraphs so content isn't lost.
      for (const item of node.content ?? []) {
        for (const child of item.content ?? []) {
          if (child.type === 'paragraph') {
            result.push({
              type: 'paragraph',
              content: [{type: 'text', text: '  '}, ...transformInlineContent(child.content)]
            })
          }
        }
      }
    } else {
      // codeBlock, blockquote etc. inside a list item — extract text as fallback
      const text = extractText(node)
      if (text) result.push({type: 'paragraph', content: [{type: 'text', text}]})
    }
  }

  return result.length > 0 ? result : [{type: 'paragraph', content: []}]
}

/** Recursively extract plain text from an ADF node — used as a last-resort fallback. */
function extractText(node: AdfNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(extractText).join('')
}

// ---------------------------------------------------------------------------
// Public entry-point
// ---------------------------------------------------------------------------

/**
 * Convert a top-level ADF document to a TipTapSerializedContent document.
 *
 * Your schema requires `content` to start with a `TiptapHeadingNode<1>`. Jira
 * issues store their title in a separate `summary` field, not in the ADF body,
 * so pass it via the `title` param and it becomes the H1. If no title is given,
 * the first heading found in the ADF body is promoted to H1; if there is none,
 * an empty H1 placeholder is prepended.
 *
 * @example
 * ```ts
 * import { convertADFToTipTap } from './convertADFToTipTap'
 *
 * const doc = convertADFToTipTap(issue.fields.description, issue.fields.summary)
 * editor.commands.setContent(doc)
 * ```
 *
 * @param adf   - The root ADF document node (type: "doc").
 * @param title - The Jira issue `summary` field, used as the H1.
 */
export function convertADFToTipTap(adf: AdfNode, title?: string): TipTapSerializedContent {
  const inputNodes = adf.type === 'doc' ? (adf.content ?? []) : [adf]
  const bodyNodes = transformChildren(inputNodes)

  // Build the mandatory H1 from the title arg, the first heading in the body,
  // or an empty placeholder — in that order of preference.
  let h1: TipTapSerializedContent['content'][0]

  if (title) {
    h1 = {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]}
  } else {
    const firstHeadingIdx = bodyNodes.findIndex((n) => n.type === 'heading')
    if (firstHeadingIdx !== -1) {
      const firstHeading = bodyNodes.splice(firstHeadingIdx, 1)[0] as Extract<
        TipTapContentNode,
        {type: 'heading'}
      >
      h1 = {...firstHeading, attrs: {level: 1}}
    } else {
      h1 = {type: 'heading', attrs: {level: 1}, content: []}
    }
  }

  const rest: TipTapContentNode[] = bodyNodes.length > 0 ? bodyNodes : [{type: 'paragraph'}]

  return {
    type: 'doc',
    content: [h1, ...rest]
  }
}

export default convertADFToTipTap
