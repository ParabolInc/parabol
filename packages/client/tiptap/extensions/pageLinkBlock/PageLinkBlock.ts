import {ReactNodeViewRenderer, type JSONContent} from '@tiptap/react'
import {PageLinkBlockBase} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
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
      },
      auto: {
        default: false,
        parseHTML: (element) => {
          return element.getAttribute('data-auto') === '' ? true : false
        },
        renderHTML: (attributes) => {
          return {
            'data-auto': attributes.auto ? '' : undefined
          }
        }
      }
    }
  },
  addCommands() {
    return {
      setPageLinkBlock:
        (attrs) =>
        ({commands}) => {
          const content = [{type: 'pageLinkBlock', attrs}, {type: 'paragraph'}] as JSONContent[]
          return commands.insertContent(content)
        }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(PageLinkBlockView, {className: 'group'})
  }

  // filterTransaction (transaction, state) {
  //   let result = true // true for keep, false for stop transaction
  //   const replaceSteps = []
  //   transaction.steps.forEach((step, index) => {
  //     if (step.jsonID === 'replace') {
  //       replaceSteps.push(index)
  //     }
  //   })

  //   replaceSteps.forEach(index => {
  //     const map = transaction.mapping.maps[index]
  //     const oldStart = map.ranges[0]
  //     const oldEnd = map.ranges[0] + map.ranges[1]
  //     state.doc.nodesBetween(oldStart, oldEnd, node => {
  //       if (node.type.name === 'custom_block') {
  //         result = false
  //       }
  //     })
  //   })
  //   return result
  // }
})
