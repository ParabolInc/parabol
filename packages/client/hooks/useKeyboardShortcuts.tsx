import {DraftEditorCommand, EditorProps, EditorState, KeyBindingUtil, RichUtils} from 'draft-js'

const {hasCommandModifier} = KeyBindingUtil
const useKeyboardShortcuts = (editorState: EditorState, setEditorState: (editorState: EditorState) => void, {handleKeyCommand, keyBindingFn}: {handleKeyCommand?: EditorProps['handleKeyCommand'], keyBindingFn?: EditorProps['keyBindingFn']}) => {
  const nextHandleKeyCommand = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      // @ts-ignore
      const result = handleKeyCommand(command)
      // @ts-ignore
      if (result === 'handled' || result === true) {
        return result
      }
    }

    if (command === 'strikethrough') {
      setEditorState(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'))
      return 'handled'
    }

    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      setEditorState(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  const nextKeyBindingFn = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    if (hasCommandModifier(e) && e.shiftKey && e.key === 'x') {
      return 'strikethrough'
    }
    return undefined
  }

  return {
    handleKeyCommand: nextHandleKeyCommand,
    keyBindingFn: nextKeyBindingFn
  }
}

export default useKeyboardShortcuts
