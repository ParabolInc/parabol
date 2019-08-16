import {DraftHandleValue, Editor, EditorState, getDefaultKeyBinding} from 'draft-js'
import React, {Component, RefObject, Suspense} from 'react'
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

interface Props {
  editorRef: RefObject<HTMLTextAreaElement>,
  editorState: EditorState,
  setEditorState: (newEditorState: EditorState) => void,
  handleBeforeInput: (char: string) => DraftHandleValue
  handleChange: (editorState: EditorState) => void
  handleKeyCommand: (command: string) => DraftHandleValue
  handleReturn: (e: React.KeyboardEvent) => DraftHandleValue
  readOnly: boolean,
  keyBindingFn: (e: React.KeyboardEvent) => string
  removeModal?: () => void
  renderModal?: () => null
  styles: React.CSSProperties
}

class TaskEditor extends Component<Props> {
  entityPasteStart: {anchorOffset: number, anchorKey: string} | undefined
  componentDidMount () {
    const {editorRef, editorState} = this.props
    if (!editorState.getCurrentContent().hasText()) {
      setTimeout(() => {
        // don't pull it from this.props above because react will mutate this.props to our advantage
        try {
          editorRef.current && editorRef.current.focus()
        } catch (e) {
          // DraftEditor was unmounted before this was called
        }
      })
    }
  }

  blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType()
    if (type === 'blockquote') {
      return 'draft-blockquote'
    } else if (type === 'code-block') {
      return 'draft-codeblock'
    }
    return ''
  }

  removeModal = () => {
    const {removeModal, renderModal} = this.props
    if (renderModal && removeModal) {
      removeModal()
    }
  }

  handleChange = (editorState) => {
    const {setEditorState, handleChange} = this.props
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
    if (!editorState.getSelection().getHasFocus()) {
      this.removeModal()
    } else if (handleChange) {
      handleChange(editorState)
    }
    setEditorState(editorState)
  }

  handleReturn = (e) => {
    const {editorRef, handleReturn, renderModal} = this.props
    if (handleReturn) {
      return handleReturn(e)
    }
    if (!e.shiftKey && !renderModal) {
      editorRef.current && editorRef.current.blur()
      return 'handled'
    }
    return 'not-handled'
  }

  handleKeyDownFallback = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    const {editorRef} = this.props
    editorRef.current && editorRef.current.blur()
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
    if (e.key === 'Escape') {
      e.preventDefault()
      this.removeModal()
      return 'not-handled'
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

  handlePastedText = (text): DraftHandleValue => {
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
    return 'not-handled'
  }

  render () {
    const {editorState, readOnly, renderModal, editorRef} = this.props
    const noText = !editorState.getCurrentContent().hasText()
    const placeholder = 'Describe what “Done” looks like'
    const useFallback = isAndroid && !readOnly
    const showFallback = useFallback && !isRichDraft(editorState)
    return (
      <RootEditor noText={noText} readOnly={readOnly}>
        {showFallback ? (
          <Suspense fallback={<div />}>
            <TaskEditorFallback
              editorState={editorState}
              placeholder={placeholder}
              onKeyDown={this.handleKeyDownFallback}
              editorRef={editorRef}
            />
          </Suspense>
        ) : (
          <Editor
            spellCheck
            blockStyleFn={this.blockStyleFn}
            editorState={editorState}
            handleBeforeInput={this.handleBeforeInput}
            handleKeyCommand={this.handleKeyCommand}
            handlePastedText={this.handlePastedText}
            handleReturn={this.handleReturn}
            keyBindingFn={this.keyBindingFn}
            onChange={this.handleChange}
            placeholder={placeholder}
            readOnly={readOnly || (useFallback && !showFallback)}
            ref={editorRef as any}
          />
        )}
        {renderModal && renderModal()}
      </RootEditor>
    )
  }
}

export default withSuggestions(
  withEmojis(withLinks(withMarkdown(withKeyboardShortcuts(TaskEditor))))
)
