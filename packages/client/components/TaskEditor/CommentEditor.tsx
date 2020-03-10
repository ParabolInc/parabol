import styled from '@emotion/styled'
import {
  convertToRaw,
  DraftEditorCommand,
  DraftHandleValue,
  Editor,
  EditorProps,
  EditorState,
  getDefaultKeyBinding
} from 'draft-js'
import React, {RefObject, Suspense, useRef} from 'react'
import {Card} from '../../types/constEnums'
import {textTags} from '../../utils/constants'
import entitizeText from '../../utils/draftjs/entitizeText'
import isAndroid from '../../utils/draftjs/isAndroid'
import isRichDraft from '../../utils/draftjs/isRichDraft'
import lazyPreload from '../../utils/lazyPreload'
import blockStyleFn from './blockStyleFn'
import './Draft.css'
import useCommentPlugins from './useCommentPlugins'

const RootEditor = styled('div')({
  fontSize: Card.FONT_SIZE,
  lineHeight: Card.LINE_HEIGHT,
  maxHeight: 84,
  overflowY: 'auto',
  width: '100%'
})

const AndroidEditorFallback = lazyPreload(() =>
  import(
    /* webpackChunkName: 'AndroidEditorFallback' */ '../../../client/components/AndroidEditorFallback'
  )
)

const TaskEditorFallback = styled(AndroidEditorFallback)({
  padding: 0
})

type DraftProps = Pick<
  EditorProps,
  'editorState' | 'handleBeforeInput' | 'handleKeyCommand' | 'keyBindingFn' | 'readOnly' | 'onFocus'
>

interface Props extends DraftProps {
  editorRef: RefObject<HTMLTextAreaElement>
  handleSubmitFallback: () => void
  placeholder: string
  setEditorState: (newEditorState: EditorState) => void
  submitComment: (rawContent: string) => void
  teamId: string
}

const CommentEditor = (props: Props) => {
  const {
    editorRef,
    editorState,
    placeholder,
    readOnly,
    setEditorState,
    onFocus,
    handleSubmitFallback,
    submitComment
  } = props
  const entityPasteStartRef = useRef<{anchorOffset: number; anchorKey: string} | undefined>()
  const {
    removeModal,
    renderModal,
    handleChange,
    handleBeforeInput,
    handleKeyCommand,
    keyBindingFn
  } = useCommentPlugins({...props})

  const onRemoveModal = () => {
    if (removeModal) {
      removeModal()
    }
  }

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
    if (!editorState.getSelection().getHasFocus()) {
      onRemoveModal()
    } else if (handleChange) {
      handleChange(editorState)
    }
    setEditorState(editorState)
  }

  const onReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    const content = editorState.getCurrentContent()
    if (content.hasText()) {
      submitComment(JSON.stringify(convertToRaw(content)))
    }
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
    if (e.key === 'Escape') {
      e.preventDefault()
      onRemoveModal()
      return 'not-handled'
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

  const onKeyDownFallback = (e: React.KeyboardEvent<Element>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    handleSubmitFallback()
  }

  const useFallback = isAndroid && !readOnly
  const showFallback = useFallback && !isRichDraft(editorState)
  return (
    <RootEditor>
      {showFallback ? (
        <Suspense fallback={<div />}>
          <TaskEditorFallback
            editorState={editorState}
            placeholder={placeholder}
            onKeyDown={onKeyDownFallback}
            editorRef={editorRef}
          />
        </Suspense>
      ) : (
        <Editor
          spellCheck
          blockStyleFn={blockStyleFn}
          editorState={editorState}
          handleBeforeInput={onBeforeInput}
          handleKeyCommand={nextKeyCommand}
          handlePastedText={onPastedText}
          handleReturn={onReturn}
          keyBindingFn={onKeyBindingFn}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          readOnly={readOnly || (useFallback && !showFallback)}
          ref={editorRef as any}
        />
      )}
      {renderModal && renderModal()}
    </RootEditor>
  )
}

export default CommentEditor
