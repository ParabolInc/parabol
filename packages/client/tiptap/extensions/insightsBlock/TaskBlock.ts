import {ReactNodeViewRenderer} from '@tiptap/react'
import {TaskBlockBase} from '../../../shared/tiptap/extensions/TaskBlockBase'
import {TaskBlockView} from './TaskBlockView'
export const TaskBlock = TaskBlockBase.extend({
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(TaskBlockView)
  }
})
