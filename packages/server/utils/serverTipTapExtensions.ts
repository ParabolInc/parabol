import {mergeAttributes} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'
import {LoomExtension} from '../../client/components/promptResponse/loomExtension'

export const serverTipTapExtensions = [
  StarterKit,
  LoomExtension,
  Mention.configure({
    renderText({node}) {
      return node.attrs.label
    }
  }),
  BaseLink.extend({
    parseHTML() {
      return [{tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])'}]
    },

    renderHTML({HTMLAttributes}) {
      return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {class: 'link'}), 0]
    }
  })
]
