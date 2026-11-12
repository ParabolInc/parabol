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
