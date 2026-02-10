import type {ImageBlockAttrs} from '~/tiptap/extensions/imageBlock/ImageBlock'
import type {InsightsBlockAttrs} from '~/tiptap/extensions/insightsBlock/InsightsBlock'
import type {FileBlockAttrs} from './extensions/FileBlockBase'
import type {FileUploadAttrs} from './extensions/FileUploadBase'
import type {PageLinkBlockAttrs} from './extensions/PageLinkBlockBase'
import type {ResponseBlockAttrs} from './extensions/ResponseBlockBase'
import type {TaskBlockAttrs} from './extensions/TaskBlockBase'

export interface TipTapSerializedContent {
  type: 'doc'
  content: [TiptapHeadingNode<1>, ...TipTapContentNode[]]
}
export interface TipTapTextNode {
  type: 'text'
  text: string
  marks?: Array<{
    type: string
    attrs?: Record<string, any>
  }>
}

interface TipTapParagraphNode {
  type: 'paragraph'
  content?: [TipTapTextNode, ...TipTapTextNode[]]
}
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
interface TiptapHeadingNode<TLevel extends HeadingLevel = HeadingLevel> {
  type: 'heading'
  attrs: {
    level: TLevel
  }
  content?: TipTapTextNode[]
}

export interface TiptapInsightsBlock {
  type: 'insightsBlock'
  attrs: InsightsBlockAttrs
  content: TipTapNode[]
}

/**
 * Union of all possible node types
 */

interface TipTapBulletListNode {
  type: 'bulletList'
  attrs: {
    tight?: boolean
  }
  content: TipTapListItemNode[]
}

interface TipTapOrderedListNode {
  type: 'orderedList'
  attrs: {
    tight?: boolean
    start: number
    type: null
  }
  content: [TipTapListItemNode]
}

interface TipTapListItemNode {
  type: 'listItem'
  content: TipTapParagraphNode[]
}

interface TipTapTaskListNode {
  type: 'taskList'
  content: TipTapTaskItemNode[]
}

interface TipTapTaskItemNode {
  type: 'taskItem'
  attrs: {
    checked: boolean
  }
  content: TipTapParagraphNode[]
}
interface TipTapTaskBlockNode {
  type: 'taskBlock'
  attrs: TaskBlockAttrs
}

interface TipTapResponseBlockNode {
  type: 'responseBlock'
  attrs: ResponseBlockAttrs
}

interface TipTapCodeBlockNode {
  type: 'codeBlock'
  attrs: {
    language: string | null
  }
  content: TipTapTextNode[]
}

interface TipTapDetailsNode {
  type: 'details'
  attrs: {
    open: boolean
  }
  content: [TipTapDetailsSummaryNode, TipTapDetailsContentNode]
}

interface TipTapDetailsSummaryNode {
  type: 'detailsSummary'
  content: TipTapTextNode[]
}

interface TipTapDetailsContentNode {
  type: 'detailsContent'
  content: TipTapContentNode[]
}

interface TipTapBlockquoteNode {
  type: 'blockquote'
  content: TipTapContentNode[]
}

export interface TipTapTableNode {
  type: 'table'
  content: [TipTapTableRowNode<TipTapTableHeaderNode>, ...TipTapTableRowNode[]]
}

export interface TipTapTableRowNode<TRowType extends TipTapTableCellNode = TipTapTableCellNode> {
  type: 'tableRow'
  content: TRowType[]
}

interface TipTapTableCellNode {
  type: 'tableCell'
  content: TipTapContentNode[]
}

export interface TipTapTableHeaderNode extends TipTapTableCellNode {
  type: 'tableHeader'
}

interface TipTapImageBlockNode {
  type: 'imageBlock'
  attrs: ImageBlockAttrs
}

interface TipTapFileBlockNode {
  type: 'fileBlock'
  attrs: FileBlockAttrs
}

interface TipTapHorizontalRuleNode {
  type: 'horizontalRule'
}

interface TipTapFileUploadNode {
  type: 'fileUpload'
  attrs: FileUploadAttrs
}

interface TipTapPageLinkBlockNode {
  type: 'pageLinkBlock'
  attrs: PageLinkBlockAttrs
}

interface TipTapThinkingBlockNode {
  type: 'thinkingBlock'
}

export type TipTapContentNode =
  | TiptapHeadingNode
  | TiptapInsightsBlock
  | TipTapParagraphNode
  | TipTapTaskBlockNode
  | TipTapBulletListNode
  | TipTapOrderedListNode
  | TipTapTaskListNode
  | TipTapCodeBlockNode
  | TipTapDetailsNode
  | TipTapBlockquoteNode
  | TipTapTableNode
  | TipTapImageBlockNode
  | TipTapHorizontalRuleNode
  | TipTapPageLinkBlockNode
  | TipTapFileBlockNode
  | TipTapFileUploadNode
  | TipTapResponseBlockNode
  | TipTapThinkingBlockNode

type TipTapNode = TiptapDoc | TipTapContentNode
