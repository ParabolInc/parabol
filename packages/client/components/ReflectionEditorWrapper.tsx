import styled from '@emotion/styled'
import {
  ContentBlock,
  DraftEditorCommand,
  DraftHandleValue,
  Editor,
  EditorProps,
  EditorState,
  getDefaultKeyBinding
} from 'draft-js'
import React, {RefObject, Suspense, useEffect, useRef} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {Card, ElementHeight, Gutters} from '../types/constEnums'
import {textTags} from '../utils/constants'
import completeEntity from '../utils/draftjs/completeEntity'
import entitizeText from '../utils/draftjs/entitizeText'
import isAndroid from '../utils/draftjs/isAndroid'
import isRichDraft from '../utils/draftjs/isRichDraft'
import lazyPreload from '../utils/lazyPreload'
import linkify from '../utils/linkify'
import './TaskEditor/Draft.css'
import useCommentPlugins from './TaskEditor/useCommentPlugins'

const EditorStyles = styled('div')(({useFallback, userSelect, isClipped}: any) => ({
  color: PALETTE.SLATE_700,
  fontSize: Card.FONT_SIZE,
  lineHeight: useFallback ? '14px' : Card.LINE_HEIGHT,
  maxHeight: isClipped ? 44 : ElementHeight.REFLECTION_CARD_MAX,
  minHeight: 16,
  overflow: 'auto',
  position: 'relative',
  userSelect,
  width: '100%'
})) as any

const AndroidEditorFallback = lazyPreload(
  () => import(/* webpackChunkName: 'AndroidEditorFallback' */ './AndroidEditorFallback')
)

type DraftProps = Pick<
  EditorProps,
  | 'editorState'
  | 'handleBeforeInput'
  | 'handleKeyCommand'
  | 'keyBindingFn'
  | 'readOnly'
  | 'onFocus'
  | 'onBlur'
  | 'ariaLabel'
>

interface Props extends DraftProps {
  editorRef?: RefObject<HTMLTextAreaElement>
  placeholder?: string
  setEditorState?: (newEditorState: EditorState) => void
  teamId: string
  isClipped?: boolean
  isPhaseItemEditor?: boolean
  handleKeyDownFallback?: (e: any) => void
  handleReturn: (e: any, editorState: EditorState) => DraftHandleValue
  userSelect?: string
  disableAnonymity?: boolean
}

const blockStyleFn = (contentBlock: ContentBlock) => {
  const type = contentBlock.getType()
  if (type === 'blockquote') {
    return 'italic border-l-4 border-solid my-4 px-2 border-slate-500'
  } else if (type === 'code-block') {
    return 'bg-slate-200 text-tomato-600 font-mono text-[13px] leading-6 m-0 px-2'
  }
  return ''
}

const ReflectionEditorWrapper = (props: Props) => {
  const {
    isClipped,
    isPhaseItemEditor,
    ariaLabel,
    editorRef,
    editorState,
    onBlur,
    onFocus,
    placeholder,
    handleKeyDownFallback,
    readOnly,
    userSelect,
    disableAnonymity,
    setEditorState,
    handleReturn
  } = props
  const entityPasteStartRef = useRef<{anchorOffset: number; anchorKey: string} | undefined>()
  const styleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPhaseItemEditor) return

    if (!editorState.getCurrentContent().hasText()) {
      const timeoutId = setTimeout(() => {
        try {
          editorRef?.current && editorRef.current.focus()
        } catch (e) {
          // DraftEditor was unmounted before this was called
        }
      })

      // Cleanup function to clear the timeout
      return () => clearTimeout(timeoutId)
    }

    return
  }, [editorState, isPhaseItemEditor, editorRef])

  useEffect(() => {
    const el = styleRef.current
    if (el) {
      el.scrollTop = isClipped ? el.scrollHeight : 0
    }
  }, [isClipped])

  const {
    removeModal,
    renderModal,
    handleChange,
    handleReturn: handleSuggestionsReturn,
    handleBeforeInput,
    handleKeyCommand,
    keyBindingFn
  } = useCommentPlugins({
    ...props,
    setEditorState:
      setEditorState ??
      (() => {
        /* noop */
      }),
    handleReturn: undefined
  })

  const onRemoveModal = () => {
    if (renderModal && removeModal) {
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
        setEditorState?.(EditorState.push(editorState, contentState, 'apply-entity'))
        return
      }
    }
    if (!editorState.getSelection().getHasFocus()) {
      onRemoveModal()
    } else if (handleChange) {
      handleChange(editorState)
    }
    setEditorState?.(editorState)
  }

  const onReturn: EditorProps['handleReturn'] = (e) => {
    if (renderModal && handleSuggestionsReturn) {
      return handleSuggestionsReturn(e, editorState)
    }

    return handleReturn(e, editorState)
  }

  const nextKeyCommand = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      return handleKeyCommand(command, editorState, Date.now())
    }
    return 'not-handled'
  }

  const onKeyBindingFn: EditorProps['keyBindingFn'] = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      if (renderModal) {
        onRemoveModal()
      } else {
        // add to callback queue so we can check activeElement and
        // determine whether modal should close in expandedReflectionStack
        setTimeout(() => {
          const el = editorRef?.current
          el?.blur()
        })
      }
      return null
    }
    return getDefaultKeyBinding(e)
  }

  const onBeforeInput = (char: string) => {
    if (handleBeforeInput) {
      return handleBeforeInput(char, editorState, Date.now())
    }
    return 'not-handled'
  }

  const handlePastedText = (text: string): DraftHandleValue => {
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
      setEditorState?.(nextEditorState)
      return 'handled'
    }
    return 'not-handled'
  }

  const useFallback = isAndroid && !readOnly
  const showFallback = useFallback && !isRichDraft(editorState)
  return (
    <EditorStyles
      useFallback={useFallback}
      userSelect={userSelect}
      isClipped={isClipped}
      ref={styleRef}
    >
      {showFallback ? (
        <Suspense fallback={<div />}>
          <AndroidEditorFallback
            editorState={editorState}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            onKeyDown={handleKeyDownFallback}
            editorRef={editorRef}
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
          handlePastedText={handlePastedText}
          handleReturn={onReturn}
          keyBindingFn={onKeyBindingFn}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly || (useFallback && !showFallback)}
          ref={editorRef as any}
          // @ts-ignore
          style={{
            padding: disableAnonymity
              ? `${Gutters.REFLECTION_INNER_GUTTER_VERTICAL} ${Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL} 0px ${Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL}`
              : `${Gutters.REFLECTION_INNER_GUTTER_VERTICAL} ${Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL}`,
            userSelect,
            WebkitUserSelect: userSelect
          }}
        />
      )}
      {renderModal && renderModal()}
    </EditorStyles>
  )
}

export default ReflectionEditorWrapper
