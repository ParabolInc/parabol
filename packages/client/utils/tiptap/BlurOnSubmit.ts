import {Extension} from '@tiptap/core'

export const BlurOnSubmit = Extension.create({
  name: 'blurOnSubmit',
  addKeyboardShortcuts(this) {
    const submit = () => {
      console.log('hi')
      this.editor.commands.blur()
      return true
    }
    return {
      Enter: submit,
      Tab: submit
    }
  }
})
