import styled from '@emotion/styled'
import {
  DraftEditorCommand,
  DraftHandleValue,
  Editor,
  EditorProps,
  EditorState,
  getDefaultKeyBinding
} from 'draft-js'
import React, {MutableRefObject, Suspense, useRef} from 'react'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import useMarkdown from '../hooks/useMarkdown'
import {SetEditorState} from '../types/draft'
import {textTags} from '../utils/constants'
import entitizeText from '../utils/draftjs/entitizeText'
import isAndroid from '../utils/draftjs/isAndroid'
import isRichDraft from '../utils/draftjs/isRichDraft'
import lazyPreload from '../utils/lazyPreload'
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
  setEditorStateFallback?: () => void
}

interface EntityPasteOffset {
  anchorOffset: number
  anchorKey: string
}

const AndroidEditorFallback = lazyPreload(
  () => import(/* webpackChunkName: 'AndroidEditorFallback' */ './AndroidEditorFallback')
)

const EditorFallback = styled(AndroidEditorFallback)({
  padding: 0,
  fontSize: 24,
  lineHeight: '32px'
})

const EditorInputWrapper = (props: Props) => {
  const {
    ariaLabel,
    setEditorState,
    editorState,
    editorRef,
    handleReturn,
    placeholder,
    readOnly,
    setEditorStateFallback
  } = props
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

  const onReturn = (e: React.KeyboardEvent) => {
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

  const onKeyBindingFn = (e: React.KeyboardEvent) => {
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

  const onPastedText = (text: string): DraftHandleValue => {
    if (text) {
      for (let i = 0; i < textTags.length; i++) {
        const tag = textTags[i]!
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

  const onKeyDownFallback = (e: React.KeyboardEvent<Element>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
  }

  // Update question on blur of the editor field.
  const handleBlur = () => {
    if (isAndroid && setEditorStateFallback) {
      setEditorStateFallback()
    }
  }

  const useFallback = isAndroid && !readOnly
  const showFallback = useFallback && !isRichDraft(editorState)

  // Make use of AndroidEditorFallback for android users.
  // Usage Reference {@see ./TaskEditor/CommentEditor.tsx}
  return (
    <>
      {showFallback ? (
        <Suspense fallback={<div />}>
          <EditorFallback
            ariaLabel={ariaLabel}
            editorState={editorState}
            placeholder={placeholder}
            onKeyDown={onKeyDownFallback}
            onPastedText={onPastedText}
            editorRef={editorRef as any}
            onBlur={handleBlur}
          />
        </Suspense>
      ) : (
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
      )}
    </>
  )
}

export default EditorInputWrapper
