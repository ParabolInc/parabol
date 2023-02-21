import styled from '@emotion/styled'
import {
  DraftEditorCommand,
  DraftHandleValue,
  Editor,
  EditorProps,
  EditorState,
  getDefaultKeyBinding
} from 'draft-js'
import React, {RefObject, Suspense, useEffect, useRef} from 'react'
import {AriaLabels, Card} from '../../types/constEnums'
import {textTags} from '../../utils/constants'
import completeEntity from '../../utils/draftjs/completeEntity'
import entitizeText from '../../utils/draftjs/entitizeText'
import isAndroid from '../../utils/draftjs/isAndroid'
import isRichDraft from '../../utils/draftjs/isRichDraft'
import lazyPreload from '../../utils/lazyPreload'
import linkify from '../../utils/linkify'
import blockStyleFn from './blockStyleFn'
import './Draft.css'
import useCommentPlugins from './useCommentPlugins'

const RootEditor = styled('div')({
  fontSize: Card.FONT_SIZE,
  lineHeight: Card.LINE_HEIGHT,
  width: '100%'
})

const AndroidEditorFallback = lazyPreload(
  () => import(/* webpackChunkName: 'AndroidEditorFallback' */ '../AndroidEditorFallback')
)

const TaskEditorFallback = styled(AndroidEditorFallback)({
  padding: 0
})

type DraftProps = Pick<
  EditorProps,
  | 'editorState'
  | 'handleBeforeInput'
  | 'handleKeyCommand'
  | 'keyBindingFn'
  | 'readOnly'
  | 'onFocus'
  | 'onBlur'
>

interface Props extends DraftProps {
  editorRef: RefObject<HTMLTextAreaElement>
  ensureCommenting?: () => void
  placeholder: string
  setEditorState: (newEditorState: EditorState) => void
  onSubmit: () => void
  teamId: string
  dataCy: string
  discussionId?: string
  autofocus?: boolean
}

const CommentEditor = (props: Props) => {
  const {
    editorRef,
    editorState,
    ensureCommenting,
    placeholder,
    readOnly,
    setEditorState,
    onSubmit,
    onBlur,
    onFocus,
    discussionId,
    autofocus,
    dataCy
  } = props
  const entityPasteStartRef = useRef<{anchorOffset: number; anchorKey: string} | undefined>()
  const {
    removeModal,
    renderModal,
    handleChange,
    handleReturn,
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

  const onReturn: EditorProps['handleReturn'] = (e) => {
    if (handleReturn) {
      return handleReturn(e, editorState)
    }
    if (!e.shiftKey && !renderModal) {
      onSubmit()
      return 'handled'
    }
    return 'not-handled'
  }

  const nextKeyCommand = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      return handleKeyCommand(command, editorState, Date.now())
    }
    return 'not-handled'
  }

  const onKeyBindingFn: EditorProps['keyBindingFn'] = (e) => {
    if (ensureCommenting) {
      ensureCommenting()
    }
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

  const onPastedText = (text: string): DraftHandleValue => {
    if (text) {
      textTags.forEach((tag) => {
        if (text.indexOf(tag) !== -1) {
          const selection = editorState.getSelection()
          entityPasteStartRef.current = {
            anchorOffset: selection.getAnchorOffset(),
            anchorKey: selection.getAnchorKey()
          }
        }
      })
    }
    const links = linkify.match(text)
    const url = links && links[0]!.url.trim()
    const trimmedText = text.trim()
    if (url === trimmedText) {
      const nextEditorState = completeEntity(editorState, 'LINK', {href: url}, trimmedText, {
        keepSelection: true
      })
      setEditorState(nextEditorState)
      return 'handled'
    }
    return 'not-handled'
  }

  const onKeyDownFallback = (e: React.KeyboardEvent<Element>) => {
    if (ensureCommenting) {
      ensureCommenting()
    }
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (renderModal || !onBlur) return
    onBlur(e)
  }

  useEffect(() => {
    if (!autofocus) {
      return
    }

    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [discussionId, autofocus])

  const useFallback = isAndroid && !readOnly
  const showFallback = useFallback && !isRichDraft(editorState)
  return (
    <RootEditor data-cy={`${dataCy}-editor`} data-private>
      {showFallback ? (
        <Suspense fallback={<div />}>
          <TaskEditorFallback
            ariaLabel={AriaLabels.COMMENT_EDITOR}
            editorState={editorState}
            placeholder={placeholder}
            onBlur={onBlur}
            onKeyDown={onKeyDownFallback}
            onPastedText={onPastedText}
            editorRef={editorRef}
          />
        </Suspense>
      ) : (
        <Editor
          ariaLabel={AriaLabels.COMMENT_EDITOR}
          spellCheck
          blockStyleFn={blockStyleFn}
          editorState={editorState}
          handleBeforeInput={onBeforeInput}
          handleKeyCommand={nextKeyCommand}
          handlePastedText={onPastedText}
          handleReturn={onReturn}
          keyBindingFn={onKeyBindingFn}
          onBlur={handleBlur}
          onFocus={onFocus}
          onChange={onChange}
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
