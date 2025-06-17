import {ReactNodeViewRenderer} from '@tiptap/react'
import {PageLinkBlockBase} from '../../../shared/tiptap/PageLinkBlockBase'
import {PageLinkBlockView} from './PageLinkBlockView'

export const PageLinkBlock = PageLinkBlockBase.extend({
  addAttributes() {
    return {
      pageId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({
          'data-id': attributes.pageId
        })
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({
          'data-title': attributes.title
        })
      }
    }
  },
  addCommands() {
    return {
      setPageLinkBlock:
        (attrs) =>
        ({commands}) => {
          return commands.insertContent({type: 'pageLinkBlock', attrs})
        }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(PageLinkBlockView)
  }
})
