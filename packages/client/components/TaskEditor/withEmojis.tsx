import {EditorState} from 'draft-js'
import React, {Component} from 'react'
import {autoCompleteEmoji} from '../../utils/draftjs/completeEntity'
import getDraftCoords from '../../utils/getDraftCoords'
import EmojiMenuContainer from './EmojiMenuContainer'
import getAnchorLocation from './getAnchorLocation'
import getWordAt from './getWordAt'

const withEmojis = (ComposedComponent) => {
  class WithEmojis extends Component<any> {
    cachedCoords: any

    state = {
      focusedEditorState: null,
      isOpen: false,
      query: ''
    }

    keyBindingFn = (e) => {
      const {keyBindingFn} = this.props
      if (keyBindingFn) {
        const result = keyBindingFn(e)
        if (result) return result
      }
      if (this.menuRef.current) {
        const handled = this.menuRef.current.handleKeyDown(e)
        if (handled) return handled
      }
      return undefined
    }

    menuRef = React.createRef<any>()

    static getDerivedStateFromProps(nextProps, prevState) {
      const {editorState} = nextProps
      return {
        // clicking on a menu will cause the editorStateSelection to lose focus, so we persist the last state before that point
        focusedEditorState: editorState.getSelection().getHasFocus()
          ? editorState
          : prevState.focusedEditorState
      }
    }

    onSelectEmoji = (emoji) => {
      const {setEditorState} = this.props
      const nextEditorState = autoCompleteEmoji(
        this.state.focusedEditorState! as EditorState,
        emoji
      )
      setEditorState(nextEditorState)
    }

    removeModal = () => {
      this.setState({
        isOpen: false,
        query: ''
      })
    }

    handleChange = (editorState) => {
      const {handleChange} = this.props
      if (handleChange) {
        handleChange(editorState)
      }
      const {block, anchorOffset} = getAnchorLocation(editorState)
      const blockText = block.getText()
      const entityKey = block.getEntityAt(anchorOffset - 1)
      const {word} = getWordAt(blockText, anchorOffset - 1)

      const inASuggestion = word && !entityKey && word[0] === ':'
      if (inASuggestion) {
        this.setState({
          isOpen: true,
          query: word.slice(1)
        })
      } else if (this.state.isOpen) {
        this.removeModal()
      }
    }

    initialize = () => {
      const {isOpen} = this.state
      if (isOpen) {
        const {renderModal, removeModal, keyBindingFn} = this
        return {renderModal, removeModal, keyBindingFn}
      }
      return {}
    }

    renderModal = () => {
      const {query} = this.state
      this.cachedCoords = getDraftCoords() || this.cachedCoords
      return (
        <EmojiMenuContainer
          removeModal={this.removeModal}
          onSelectEmoji={this.onSelectEmoji}
          query={query}
          menuRef={this.menuRef}
          originCoords={this.cachedCoords}
        />
      )
    }

    render() {
      return (
        <ComposedComponent
          {...this.props}
          {...this.initialize()}
          handleChange={this.handleChange}
        />
      )
    }
  }
  return WithEmojis as any
}

export default withEmojis
