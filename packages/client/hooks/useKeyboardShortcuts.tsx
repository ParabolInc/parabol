import {DraftEditorCommand, EditorProps, EditorState, KeyBindingUtil, RichUtils} from 'draft-js'
import {SetEditorState} from '../types/draft'

const {hasCommandModifier} = KeyBindingUtil

type Handlers = Pick<EditorProps, 'handleKeyCommand' | 'keyBindingFn'>
const useKeyboardShortcuts = (
  editorState: EditorState,
  setEditorState: SetEditorState,
  {handleKeyCommand, keyBindingFn}: Handlers
) => {
  const nextHandleKeyCommand: Handlers['handleKeyCommand'] = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      const result = handleKeyCommand(command, editorState, Date.now())
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

  const nextKeyBindingFn: Handlers['keyBindingFn'] = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    if (hasCommandModifier(e) && e.shiftKey && e.key === 'x') {
      return 'strikethrough'
    }
    return null
  }

  return {
    handleKeyCommand: nextHandleKeyCommand,
    keyBindingFn: nextKeyBindingFn
  }
}

export default useKeyboardShortcuts
