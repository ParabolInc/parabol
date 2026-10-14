import {Mark} from '@tiptap/core'

export const PAGE_COMMENT_MARK_NAME = 'pageComment'

export const PageCommentMarkBase = Mark.create({
  name: PAGE_COMMENT_MARK_NAME,

  inclusive: false,

  // threads may overlap, so a thread's mark must not replace another thread's mark
  excludes: '',

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-thread-id'),
        renderHTML: (attributes) => ({'data-thread-id': attributes.threadId})
      }
    }
  },

  parseHTML() {
    return [{tag: 'span[data-thread-id]'}]
  },

  renderHTML({HTMLAttributes}) {
    return ['span', HTMLAttributes, 0]
  }
})
