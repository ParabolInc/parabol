import {DraftHandleValue, Editor, EditorState, getDefaultKeyBinding} from 'draft-js'
import React, {Component, RefObject} from 'react'
import './TaskEditor/Draft.css'
import withKeyboardShortcuts from './TaskEditor/withKeyboardShortcuts'
import withMarkdown from './TaskEditor/withMarkdown'
import {textTags} from '../utils/constants'
import entitizeText from '../utils/draftjs/entitizeText'

interface Props {
  ariaLabel: string
  editorRef: RefObject<HTMLTextAreaElement>,
  editorState: EditorState,
  setEditorState: (newEditorState: EditorState) => void,
  handleBeforeInput: (char: string) => DraftHandleValue
  handleChange: (editorState: EditorState) => void
  handleKeyCommand: (command: string) => DraftHandleValue
  handleReturn: (e: React.KeyboardEvent) => DraftHandleValue
  readOnly: boolean,
  onBlur: (e: React.FocusEvent) => void
  placeholder: string
  innerRef: RefObject<any>
  keyBindingFn: (e: React.KeyboardEvent) => string
  styles: React.CSSProperties
}


class EditorInputWrapper extends Component<Props> {
  entityPasteStart?: {anchorOffset: number; anchorKey: string} = undefined
  blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType()
    if (type === 'blockquote') {
      return 'draft-blockquote'
    } else if (type === 'code-block') {
      return 'draft-codeblock'
    }
    return ''
  }

  handleChange = (editorState) => {
    const {handleChange, setEditorState} = this.props
    if (this.entityPasteStart) {
      const {anchorOffset, anchorKey} = this.entityPasteStart
      const selectionState = editorState.getSelection().merge({
        anchorOffset,
        anchorKey
      })
      const contentState = entitizeText(editorState.getCurrentContent(), selectionState)
      this.entityPasteStart = undefined
      if (contentState) {
        setEditorState(EditorState.push(editorState, contentState, 'apply-entity'))
        return
      }
    }
    if (editorState.getSelection().getHasFocus() && handleChange) {
      handleChange(editorState)
    }
    setEditorState(editorState)
  }

  handleReturn = (e) => {
    const {handleReturn, innerRef} = this.props
    if (handleReturn) {
      return handleReturn(e)
    }
    if (e.shiftKey || !innerRef.current) {
      return 'not-handled'
    }
    innerRef.current.blur()
    return 'handled'
  }

  handleKeyCommand = (command) => {
    const {handleKeyCommand} = this.props
    if (handleKeyCommand) {
      return handleKeyCommand(command)
    }
    return 'not-handled'
  }

  keyBindingFn = (e) => {
    const {keyBindingFn} = this.props
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    return getDefaultKeyBinding(e)
  }

  handleBeforeInput = (char) => {
    const {handleBeforeInput} = this.props
    if (handleBeforeInput) {
      return handleBeforeInput(char)
    }
    return 'not-handled'
  }

  handlePastedText = (text) => {
    if (text) {
      for (let i = 0; i < textTags.length; i++) {
        const tag = textTags[i]
        if (text.indexOf(tag) !== -1) {
          const selection = this.props.editorState.getSelection()
          this.entityPasteStart = {
            anchorOffset: selection.getAnchorOffset(),
            anchorKey: selection.getAnchorKey()
          }
        }
      }
    }
    return 'not-handled' as 'not-handled'
  }

  render () {
    const {ariaLabel, editorState, onBlur, placeholder, readOnly, innerRef} = this.props
    return (
      <Editor
        spellCheck
        ariaLabel={ariaLabel}
        blockStyleFn={this.blockStyleFn}
        editorState={editorState}
        handleBeforeInput={this.handleBeforeInput}
        handleKeyCommand={this.handleKeyCommand}
        handlePastedText={this.handlePastedText}
        handleReturn={this.handleReturn}
        keyBindingFn={this.keyBindingFn}
        onBlur={onBlur}
        onChange={this.handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={innerRef}
      />
    )
  }
}

export default withMarkdown(withKeyboardShortcuts(EditorInputWrapper))
