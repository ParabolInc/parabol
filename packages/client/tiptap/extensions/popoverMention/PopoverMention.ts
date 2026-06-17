import {ReactNodeViewRenderer} from '@tiptap/react'
import {PopoverMentionBase} from '../../../shared/tiptap/extensions/PopoverMentionBase'
import {PopoverMentionView} from './PopoverMentionView'

export const PopoverMention = PopoverMentionBase.extend({
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(PopoverMentionView)
  }
})
