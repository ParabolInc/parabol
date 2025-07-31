import {ReactNodeViewRenderer} from '@tiptap/react'
import {ThinkingBlockBase} from '../../../shared/tiptap/extensions/ThinkingBlockBase'
import {ThinkingBlockView} from './ThinkingBlockView'
export const ThinkingBlock = ThinkingBlockBase.extend({
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(ThinkingBlockView)
  }
})
