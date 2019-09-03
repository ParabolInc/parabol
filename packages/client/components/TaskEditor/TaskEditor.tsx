import {ContentBlock, DraftHandleValue, Editor, EditorProps, EditorState, getDefaultKeyBinding} from 'draft-js'
import React, {RefObject, Suspense, useEffect, useRef} from 'react'
import withMarkdown from './withMarkdown'
import ui from '../../styles/ui'
import {textTags} from '../../utils/constants'
import entitizeText from '../../utils/draftjs/entitizeText'
import './Draft.css'
import withKeyboardShortcuts from './withKeyboardShortcuts'
import withLinks from './withLinks'
import withSuggestions from './withSuggestions'
import withEmojis from './withEmojis'
import styled from '@emotion/styled'
import lazyPreload from '../../utils/lazyPreload'
import isRichDraft from '../../utils/draftjs/isRichDraft'
import isAndroid from '../../utils/draftjs/isAndroid'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import useMarkdown from '../../hooks/useMarkdown'

const RootEditor = styled('div')<{noText: boolean, readOnly: boolean}>(({noText, readOnly}) => ({
  cursor: readOnly ? undefined : 'text',
  fontSize: ui.cardContentFontSize,
  lineHeight: ui.cardContentLineHeight,
  padding: `0 ${ui.cardPaddingBase}`,
  height: noText ? '2.75rem' : undefined // Use this if the placeholder wraps
}))

const AndroidEditorFallback = lazyPreload(() =>
  import(
    /* webpackChunkName: 'AndroidEditorFallback' */ '../../../client/components/AndroidEditorFallback'
    )
)

const TaskEditorFallback = styled(AndroidEditorFallback)({
  padding: 0
})

type DraftProps = Pick<EditorProps, 'editorState' | 'handleBeforeInput' | 'onChange' | 'handleKeyCommand' | 'handleReturn' | 'keyBindingFn' | 'readOnly'>
interface Props extends DraftProps {
  editorRef: RefObject<HTMLTextAreaElement>,
  handleChange: EditorProps['onChange'] // TODO refactor
  setEditorState: (newEditorState: EditorState) => void,
  removeModal?: () => void
  renderModal?: () => null
  styles: React.CSSProperties
}

const blockStyleFn = (contentBlock: ContentBlock) => {
  const type = contentBlock.getType()
  if (type === 'blockquote') {
    return 'draft-blockquote'
  } else if (type === 'code-block') {
    return 'draft-codeblock'
  }
  return ''
}

const TaskEditor = (props: Props) => {
  const {editorRef, editorState, readOnly, removeModal, renderModal, setEditorState, handleChange, handleReturn, handleKeyCommand, keyBindingFn, handleBeforeInput} = props
  const entityPasteStartRef = useRef<{anchorOffset: number, anchorKey: string} | undefined>()
  const ks = useKeyboardShortcuts(editorState, setEditorState, {handleKeyCommand, keyBindingFn})
  const md = useMarkdown(editorState, setEditorState, {handleKeyCommand, handleBeforeInput, keyBindingFn, onChange: handleChange, ...ks})

  useEffect(() => {
    if (!editorState.getCurrentContent().hasText()) {
      editorRef.current && editorRef.current.focus()
    }
  }, [])

  const onRemoveModal = () => {
    if (renderModal && removeModal) {
      removeModal()
    }
  }

  const onChange = (editorState) => {
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
    if (handleReturn) {
      return handleReturn(e)
    }
    if (!e.shiftKey && !renderModal) {
      editorRef.current && editorRef.current.blur()
      return 'handled'
    }
    return 'not-handled'
  }

  const onKeyDownFallback = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    editorRef.current && editorRef.current.blur()
  }

  const onKeyCommand = (command) => {
    if (handleKeyCommand) {
      return handleKeyCommand(command)
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

  const onBeforeInput = (char) => {
    if (handleBeforeInput) {
      return handleBeforeInput(char)
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

  const noText = !editorState.getCurrentContent().hasText()
  const placeholder = 'Describe what “Done” looks like'
  const useFallback = isAndroid && !readOnly
  const showFallback = useFallback && !isRichDraft(editorState)
  return (
    <RootEditor noText={noText} readOnly={readOnly}>
      {showFallback ? (
        <Suspense fallback={<div/>}>
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
          handleKeyCommand={onKeyCommand}
          handlePastedText={onPastedText}
          handleReturn={onReturn}
          keyBindingFn={onKeyBindingFn}
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

export default withSuggestions(
  withEmojis(withLinks(withMarkdown(TaskEditor)))
)
