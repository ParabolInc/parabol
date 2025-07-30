import {type Editor, useEditorState} from '@tiptap/react'
import isTextSelected from '../components/promptResponse/isTextSelected'
import {isCustomNodeSelected} from '../tiptap/isCustomNodeSelected'

export const getShouldShow = (editor: Editor) => {
  if (editor.view.dragging || isCustomNodeSelected(editor)) {
    return false
  }

  return isTextSelected(editor)
}

export const useBubbleMenuStates = (editor: Editor) => {
  const states = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold'),
        isItalic: ctx.editor.isActive('italic'),
        isStrike: ctx.editor.isActive('strike'),
        isUnderline: ctx.editor.isActive('underline'),
        isLink: ctx.editor.isActive('link')
      }
    }
  })
  return {
    ...states
  }
}
