import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'

interface Props {
  node: Node
  pos: number
}

export const pagePlaceholderText = ({node, pos}: Props) => {
  const {type, attrs} = node
  switch (type.name) {
    case 'heading':
      if (pos === 0) return 'New Page'
      return `Heading ${attrs.level}`
    case 'codeBlock':
      return 'New code'
    case 'blockquote':
      return 'New quote'
    case 'calloutTitle':
      return 'Title'
    case 'paragraph':
      return "Press '/' for commands"
    case 'detailsSummary':
      return 'New summary'
    case 'detailsContent': {
      const isDefaultEmpty =
        node.childCount === 0 ||
        (node.childCount === 1 &&
          node.firstChild?.type.name === 'paragraph' &&
          node.firstChild.content.size === 0)
      return isDefaultEmpty ? 'Add details, use / to add blocks' : ''
    }
    default:
      return ''
  }
}

export const syncedBlockPlaceholderText = (props: Props & {editor: Editor}) => {
  const {node, pos, editor} = props
  if (pos === 0) return ''
  const firstContentPos = editor.state.doc.firstChild?.nodeSize
  if (node.type.name === 'paragraph' && pos === firstContentPos) {
    return 'Type here. It stays in sync wherever you paste it.'
  }
  return pagePlaceholderText(props)
}
