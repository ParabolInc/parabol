import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js'
import PropTypes from 'prop-types'
import React, {Component, Suspense} from 'react'
import withMarkdown from 'universal/components/TaskEditor/withMarkdown'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {textTags} from 'universal/utils/constants'
import entitizeText from 'universal/utils/draftjs/entitizeText'
import './Draft.css'
import withKeyboardShortcuts from './withKeyboardShortcuts'
import withLinks from './withLinks'
import withSuggestions from './withSuggestions'
import withEmojis from 'universal/components/TaskEditor/withEmojis'
import styled, {css} from 'react-emotion'
import lazyPreload from 'universal/utils/lazyPreload'
import isRichDraft from 'universal/utils/draftjs/isRichDraft'
import isAndroid from 'universal/utils/draftjs/isAndroid'

const RootEditor = styled('div')(({noText}) => ({
  fontSize: ui.cardContentFontSize,
  lineHeight: ui.cardContentLineHeight,
  padding: `0 ${ui.cardPaddingBase}`,
  height: noText ? '2.75rem' : undefined // Use this if the placeholder wraps
}))

const editorBlockquoteStyles = css({
  fontStyle: 'italic',
  borderLeft: `.125rem ${appTheme.palette.mid40a} solid`,
  margin: '.5rem 0',
  padding: '0 .5rem'
})

const codeBlockStyles = css({
  backgroundColor: appTheme.palette.light,
  borderLeft: `.125rem ${appTheme.palette.mid40a} solid`,
  borderRadius: '.0625rem',
  fontFamily: appTheme.typography.monospace,
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s6,
  margin: '0',
  padding: '0 .5rem'
})

const AndroidEditorFallback = lazyPreload(() =>
  import(/* webpackChunkName: 'AndroidEditorFallback' */ 'universal/components/AndroidEditorFallback')
)

const TaskEditorFallback = styled(AndroidEditorFallback)({
  padding: 0
})

class TaskEditor extends Component {
  static propTypes = {
    editorRef: PropTypes.any,
    editorState: PropTypes.object,
    setEditorState: PropTypes.func,
    trackEditingComponent: PropTypes.func,
    handleBeforeInput: PropTypes.func,
    handleChange: PropTypes.func,
    handleKeyCommand: PropTypes.func,
    handleReturn: PropTypes.func,
    readOnly: PropTypes.bool,
    keyBindingFn: PropTypes.func,
    renderModal: PropTypes.func,
    removeModal: PropTypes.func,
    setEditorRef: PropTypes.func.isRequired,
    styles: PropTypes.object
  }

  state = {}

  componentDidMount () {
    const {editorState} = this.props
    if (!editorState.getCurrentContent().hasText()) {
      setTimeout(() => {
        // don't pull it from this.props above because react will mutate this.props to our advantage
        const {editorRef} = this.props
        try {
          editorRef.focus()
        } catch (e) {
          // DraftEditor was unmounted before this was called
        }
      })
    }
  }

  blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType()
    if (type === 'blockquote') {
      return editorBlockquoteStyles
    } else if (type === 'code-block') {
      return codeBlockStyles
    }
    return undefined
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
      editorRef.blur()
      return 'handled'
    }
    return 'not-handled'
  }

  handleKeyDownFallback = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    const {editorRef} = this.props
    editorRef.blur()
  }

  handleKeyCommand = (command) => {
    const {handleKeyCommand} = this.props
    if (handleKeyCommand) {
      return handleKeyCommand(command)
    }
    return undefined
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
      return undefined
    }
    return getDefaultKeyBinding(e)
  }

  handleBeforeInput = (char) => {
    const {handleBeforeInput} = this.props
    if (handleBeforeInput) {
      return handleBeforeInput(char)
    }
    return undefined
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
    return 'not-handled'
  }

  render () {
    const {editorState, readOnly, renderModal, setEditorRef} = this.props
    const noText = !editorState.getCurrentContent().hasText()
    const placeholder = 'Describe what “Done” looks like'
    const useFallback = isAndroid && !readOnly
    const showFallback = useFallback && !isRichDraft(editorState)
    return (
      <RootEditor noText={noText}>
        {showFallback ? (
          <Suspense fallback={<div />}>
            <TaskEditorFallback
              editorState={editorState}
              placeholder={placeholder}
              onKeyDown={this.handleKeyDownFallback}
              setEditorRef={setEditorRef}
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
            ref={setEditorRef}
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
