import {mergeAttributes} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import Mention, {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import {TaskItem} from '@tiptap/extension-task-item'
import {TaskList} from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import {LoomExtension} from '../../components/promptResponse/loomExtension'
import {UniqueID} from '../../tiptap/extensions/docWithID/UniqueID'
import {ImageBlockBase} from '../../tiptap/extensions/imageBlock/ImageBlockBase'
import {tiptapTagConfig} from '../../utils/tiptapTagConfig'
import {ImageUploadBase} from './extensions/ImageUploadBase'
import {InsightsBlockBase} from './extensions/InsightsBlockBase'

export const mentionConfig: Partial<MentionOptions<any, MentionNodeAttrs>> = {
  renderText({node}) {
    return node.attrs.label
  },
  renderHTML({options, node}) {
    return ['span', options.HTMLAttributes, `${node.attrs.label ?? node.attrs.id}`]
  }
}
export const serverTipTapExtensions = [
  StarterKit,
  Underline,
  TaskList,
  TaskItem.configure({
    nested: true
  }),
  ImageUploadBase,
  ImageBlockBase,
  LoomExtension,
  Mention.configure(mentionConfig),
  Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
  BaseLink.extend({
    parseHTML() {
      return [{tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])'}]
    },

    renderHTML({HTMLAttributes}) {
      return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {class: 'link'}), 0]
    }
  }),
  InsightsBlockBase,
  UniqueID
]
