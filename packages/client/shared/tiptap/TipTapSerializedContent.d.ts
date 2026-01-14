export interface TipTapSerializedContent {
  type: 'doc'
  content: [TiptapHeadingNode<1>, ...TiptapContentNode[]]
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
  content: TipTapTextNode[]
}

export interface TiptapInsightsBlock {
  type: 'insightsBlock'
  attrs: {
    id: string
    editing: boolean
    teamIds: string[]
    meetingTypes: string[]
    after: string
    before: string
    meetingIds: string[]
    title: string
    hash: string
    prompt: string
    error: string | null
  }
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
  attrs: {
    id: string
    status: string
    preferredName: string
    avatar: string
    service: string
    content: string
  }
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
  content: TiptapContentNode[]
}

interface TipTapBlockquoteNode {
  type: 'blockquote'
  content: TiptapContentNode[]
}

interface TipTapTableNode {
  type: 'table'
  content: TipTapTableRowNode[]
}

interface TipTapTableRowNode {
  type: 'tableRow'
  content: (TipTapTableCellNode | TipTapTableHeaderNode)[]
}

interface TipTapTableCellNode {
  type: 'tableCell'
  content: TiptapContentNode[]
}
interface TipTapTableHeaderNode extends TipTapTableCellNode {
  type: 'tableHeader'
  content: (TipTapTableCellNode | TipTapTableHeaderNode)[]
}

interface TipTapImageBlockNode {
  type: 'imageBlock'
  attrs: {
    src: str
    height: number
    width: number
    align: 'center' | 'left' | 'right'
  }
}

interface TipTapHorizontalRuleNode {
  type: 'horizontalRule'
}

interface TipTapImageUploadNode {
  type: 'imageUpload'
}

interface TipTapPageLinkBlockNode {
  type: 'pageLinkBlock'
  attrs: {
    pageCode: number
    title: string
    canonical: null | boolean
    database: null | boolean
  }
}

export type TiptapContentNode =
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
  | TipTapImageUploadNode

type TipTapNode = TiptapDoc | TiptapContentNode
