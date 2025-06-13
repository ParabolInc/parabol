import {mergeAttributes} from '@tiptap/core'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import Mention, {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
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
  StarterKit.extend({
    link: {
      parseHTML() {
        return [{tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])'}]
      },

      renderHTML({HTMLAttributes}: {HTMLAttributes: Record<string, any>}) {
        return [
          'a',
          mergeAttributes((this as any).options.HTMLAttributes, HTMLAttributes, {class: 'link'}),
          0
        ]
      }
    }
  } as any),
  TaskList,
  TaskItem.configure({
    nested: true
  }),
  ImageUploadBase,
  ImageBlockBase,
  LoomExtension,
  Mention.configure(mentionConfig),
  Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
  InsightsBlockBase,
  UniqueID
]
