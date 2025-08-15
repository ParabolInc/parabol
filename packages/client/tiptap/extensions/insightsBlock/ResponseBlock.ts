import {ReactNodeViewRenderer} from '@tiptap/react'
import {ResponseBlockBase} from '../../../shared/tiptap/extensions/ResponseBlockBase'
import {ResponseBlockView} from './ResponseBlockView'
export const ResponseBlock = ResponseBlockBase.extend({
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(ResponseBlockView)
  }
})
