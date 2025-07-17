import {Extension} from '@tiptap/core'

declare module '@tiptap/core' {
  interface EditorEvents {
    clearOnSubmit: {}
  }

  interface Commands<ReturnType> {
    clearOnSubmit: {
      clearOnSubmit: () => ReturnType
    }
  }
}

// Same as clearContent but conveys the intent and emits an event
export const ClearOnSubmit = Extension.create({
  name: 'clearOnSubmit',

  addCommands() {
    return {
      clearOnSubmit:
        () =>
        ({editor, commands}) => {
          const ret = commands.setContent('')
          editor.emit('clearOnSubmit', {})
          return ret
        }
    }
  }
})
