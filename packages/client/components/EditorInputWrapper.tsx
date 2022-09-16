import {
  DraftEditorCommand,
  DraftHandleValue,
  Editor,
  EditorProps,
  EditorState,
  getDefaultKeyBinding
} from 'draft-js'
import React, {MutableRefObject, useRef} from 'react'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import useMarkdown from '../hooks/useMarkdown'
import {SetEditorState} from '../types/draft'
import {textTags} from '../utils/constants'
import entitizeText from '../utils/draftjs/entitizeText'
import blockStyleFn from './TaskEditor/blockStyleFn'
import './TaskEditor/Draft.css'

type Handlers = Pick<
  EditorProps,
  'handleBeforeInput' | 'handleKeyCommand' | 'handleReturn' | 'keyBindingFn'
>

interface Props extends Handlers {
  ariaLabel: string
  editorRef: MutableRefObject<HTMLTextAreaElement | undefined>
  editorState: EditorState
  setEditorState: SetEditorState
  readOnly: boolean
  placeholder: string
}

interface EntityPasteOffset {
  anchorOffset: number
  anchorKey: string
}

const EditorInputWrapper = (props: Props) => {
  const {ariaLabel, setEditorState, editorState, editorRef, handleReturn, placeholder, readOnly} =
    props
  const entityPasteStartRef = useRef<EntityPasteOffset | undefined>(undefined)
  const ks = useKeyboardShortcuts(editorState, setEditorState, {
    handleKeyCommand: props.handleKeyCommand,
    keyBindingFn: props.keyBindingFn
  })
  const {
    handleBeforeInput,
    handleKeyCommand,
    keyBindingFn,
    onChange: handleChange
  } = useMarkdown(editorState, setEditorState, {
    handleKeyCommand: ks.handleKeyCommand,
    keyBindingFn: ks.keyBindingFn,
    handleBeforeInput: props.handleBeforeInput
  })

  const onChange = (editorState: EditorState) => {
    const {current: entityPasteStart} = entityPasteStartRef
    if (entityPasteStart) {
      const {anchorOffset, anchorKey} = entityPasteStart
      const selectionState = editorState.getSelection().merge({
        anchorOffset,
        anchorKey
      })
      const contentState = entitizeText(editorState.getCurrentContent(), selectionState)
      entityPasteStartRef.current = undefined
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

  const onReturn = (e) => {
    if (handleReturn) {
      return handleReturn(e, editorState)
    }
    if (e.shiftKey || !editorRef.current) {
      return 'not-handled'
    }
    editorRef.current.blur()
    return 'handled'
  }

  const nextKeyCommand = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      return handleKeyCommand(command, editorState, Date.now())
    }
    return 'not-handled'
  }

  const onKeyBindingFn = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    return getDefaultKeyBinding(e)
  }

  const onBeforeInput = (char: string) => {
    if (handleBeforeInput) {
      return handleBeforeInput(char, editorState, Date.now())
    }
    return 'not-handled'
  }

  const onPastedText = (text): DraftHandleValue => {
    if (text) {
      for (let i = 0; i < textTags.length; i++) {
        const tag = textTags[i]
        if (text.indexOf(tag) !== -1) {
          const selection = editorState.getSelection()
          entityPasteStartRef.current = {
            anchorOffset: selection.getAnchorOffset(),
            anchorKey: selection.getAnchorKey()
          }
        }
      }
    }
    return 'not-handled'
  }

  return (
    <Editor
      spellCheck
      ariaLabel={ariaLabel}
      blockStyleFn={blockStyleFn}
      editorState={editorState}
      handleBeforeInput={onBeforeInput}
      handleKeyCommand={nextKeyCommand}
      handlePastedText={onPastedText}
      handleReturn={onReturn}
      keyBindingFn={onKeyBindingFn}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      ref={editorRef as any}
    />
  )
}

export default EditorInputWrapper
