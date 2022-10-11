import {EditorProps, KeyBindingUtil, RichUtils} from 'draft-js'
import React, {Component} from 'react'

const {hasCommandModifier} = KeyBindingUtil

const withKeyboardShortcuts = (ComposedComponent: any) => {
  class WithKeyboardShortcuts extends Component<any> {
    handleKeyCommand: EditorProps['handleKeyCommand'] = (command) => {
      const {handleKeyCommand, editorState, setEditorState} = this.props
      if (handleKeyCommand) {
        const result = handleKeyCommand(command)
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

    keyBindingFn: EditorProps['keyBindingFn'] = (e) => {
      const {keyBindingFn} = this.props
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

    render() {
      return (
        <ComposedComponent
          {...this.props}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={this.keyBindingFn}
        />
      )
    }
  }
  return WithKeyboardShortcuts as any
}

export default withKeyboardShortcuts
