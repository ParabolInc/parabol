import {DraftHandleValue, Editor, EditorState, getDefaultKeyBinding} from 'draft-js'
import React, {PureComponent, RefObject, Suspense} from 'react'
import './TaskEditor/Draft.css'
import withKeyboardShortcuts from './TaskEditor/withKeyboardShortcuts'
import withMarkdown from './TaskEditor/withMarkdown'
import appTheme from '../styles/theme/appTheme'
import {textTags} from '../utils/constants'
import entitizeText from '../utils/draftjs/entitizeText'
import styled from '@emotion/styled'
import {cardContentFontSize, cardContentLineHeight} from '../styles/cards'
import withEmojis from './TaskEditor/withEmojis'
import isRichDraft from '../utils/draftjs/isRichDraft'
import lazyPreload from '../utils/lazyPreload'
import isAndroid from '../utils/draftjs/isAndroid'
import {ElementHeight} from '../types/constEnums'

interface Props {
  ariaLabel: string
  autoFocusOnEmpty: boolean
  editorRef: RefObject<HTMLTextAreaElement>
  editorState: EditorState
  handleBeforeInput: (char: string) => DraftHandleValue
  handleChange: (editorState: EditorState) => void
  handleKeyCommand: (command: string) => DraftHandleValue
  handleReturn: (e: React.KeyboardEvent) => DraftHandleValue
  isBlurred: boolean
  isClipped?: boolean
  keyBindingFn: (e: React.KeyboardEvent) => string
  placeholder: string
  onBlur: () => void
  onFocus: () => void
  readOnly: boolean
  removeModal?: () => void
  renderModal?: () => null
  setEditorState: (editorState: EditorState) => void
  innerRef: (c: any) => void
  handleKeyDownFallback: () => void
  userSelect: string
}

const editorBlockquote = {
  fontStyle: 'italic',
  borderLeft: `.25rem ${appTheme.palette.mid40a} solid`,
  margin: '1rem 0',
  padding: '0 .5rem'
}

const codeBlock = {
  backgroundColor: appTheme.palette.mid10a,
  color: appTheme.palette.warm,
  fontFamily: appTheme.typography.monospace,
  fontSize: 13,
  lineHeight: '24px',
  margin: '0',
  padding: '0 .5rem'
}

const EditorStyles = styled('div')(({useFallback, userSelect, isClipped}: any) => ({
  color: appTheme.palette.dark,
  fontSize: cardContentFontSize,
  lineHeight: useFallback ? '14px' : cardContentLineHeight,
  maxHeight: isClipped ? 44 : ElementHeight.REFLECTION_CARD_MAX,
  minHeight: 16,
  overflow: 'auto',
  position: 'relative',
  userSelect,
  width: '100%'
})) as any

const AndroidEditorFallback = lazyPreload(() =>
  import(
    /* webpackChunkName: 'AndroidEditorFallback' */ './AndroidEditorFallback'
    )
)

class ReflectionEditorWrapper extends PureComponent<Props> {
  entityPasteStart?: {anchorOffset: number; anchorKey: string} = undefined
  styleRef = React.createRef<HTMLDivElement>()

  componentDidMount() {
    if (!this.props.editorState.getCurrentContent().hasText()) {
      setTimeout(() => {
        try {
          this.props.editorRef.current && this.props.editorRef.current.focus()
        } catch (e) {
          // DraftEditor was unmounted before this was called
        }
      })
    }
    if (this.props.isClipped) {
      const el = this.styleRef.current
      if (el) {
        el.scrollTop = el.scrollHeight
      }

    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // make sure the text isn't visible when it's clipped
    if (prevProps.isClipped !== this.props.isClipped) {
      const el = this.styleRef.current!
      el.scrollTop = this.props.isClipped ? el.scrollHeight : 0
    }
  }

  blockStyleFn = (contentBlock) => {
    // TODO complete emtotion migration to provider a string className
    const type = contentBlock.getType()
    if (type === 'blockquote') {
      return editorBlockquote
    } else if (type === 'code-block') {
      return codeBlock
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
    if (!editorState.getSelection().getHasFocus()) {
      this.removeModal()
    } else if (handleChange) {
      handleChange(editorState)
    }
    setEditorState(editorState)
  }

  handleReturn = (e) => {
    const {handleReturn, renderModal} = this.props
    if (handleReturn && !renderModal) {
      return handleReturn(e)
    }
    return 'not-handled'
  }

  handleKeyCommand = (command) => {
    const {handleKeyCommand} = this.props
    if (handleKeyCommand) {
      return handleKeyCommand(command)
    }
    return 'not-handled'
  }

  keyBindingFn = (e) => {
    const {keyBindingFn, renderModal} = this.props
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      if (renderModal) {
        this.removeModal()
      } else {
        const el = this.props.editorRef.current
        el && el.blur()
      }
      return null
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

  removeModal = () => {
    const {removeModal, renderModal} = this.props
    if (renderModal && removeModal) {
      removeModal()
    }
  }

  render() {
    const {
      isClipped,
      ariaLabel,
      editorRef,
      editorState,
      onBlur,
      onFocus,
      placeholder,
      handleKeyDownFallback,
      renderModal,
      readOnly,
      userSelect
    } = this.props
    const useFallback = isAndroid && !readOnly
    const showFallback = useFallback && !isRichDraft(editorState)
    return (
      <EditorStyles useFallback={useFallback} userSelect={userSelect} isClipped={isClipped} ref={this.styleRef}>
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
          // @ts-ignore
          <Editor
            spellCheck
            ariaLabel={ariaLabel}
            editorState={editorState}
            handleBeforeInput={this.handleBeforeInput}
            handleKeyCommand={this.handleKeyCommand}
            handlePastedText={this.handlePastedText}
            handleReturn={this.handleReturn}
            keyBindingFn={this.keyBindingFn}
            onBlur={onBlur}
            onFocus={onFocus}
            onChange={this.handleChange}
            placeholder={placeholder}
            readOnly={readOnly || (useFallback && !showFallback)}
            ref={editorRef as any}
            style={{
              padding: 12,
              userSelect,
              WebkitUserSelect: userSelect
            }}
          />
        )}
        {renderModal && renderModal()}
      </EditorStyles>
    )
  }
}

export default withEmojis(withMarkdown(withKeyboardShortcuts(ReflectionEditorWrapper)))
