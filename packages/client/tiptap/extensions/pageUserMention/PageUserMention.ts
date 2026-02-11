import type {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import Mention from '@tiptap/extension-mention'
import type Atmosphere from '../../../Atmosphere'

export interface PageUserMentionOptions extends MentionOptions<any, MentionNodeAttrs> {
  atmosphere?: Atmosphere
}

export const PageUserMention = Mention.extend<PageUserMentionOptions>({
  name: 'pageUserMention',
  addOptions() {
    return {
      ...this.parent?.(),
      atmosphere: undefined
    } as PageUserMentionOptions
  },
  renderText({node}) {
    return node.attrs.label
  },
  renderHTML({HTMLAttributes, node}) {
    return ['span', {...HTMLAttributes, class: 'page-user-mention'}, `@${node.attrs.label}`]
  }
})
