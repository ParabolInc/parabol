import {EditorState} from 'draft-js'
import React, {Component, Ref} from 'react'
import stringScore from 'string-score'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuProps} from '../hooks/useMenu'
import emojiArray from '../utils/emojiArray'

interface EmojiSuggestion {
  value: string
  emoji: string
}

interface Props {
  menuProps: MenuProps
  editorState: EditorState
  menuItemClickFactory: (emoji: string, editorState: EditorState) => (e: React.MouseEvent) => void
  menuRef: Ref<any>
  query: string
}

interface State {
  focusedEditorState: EditorState | null
  suggestedEmojis: EmojiSuggestion[]
  query: string
}

class EmojiMenu extends Component<Props, State> {
  static filterByQuery(query: string) {
    if (!query) {
      return emojiArray.slice(2, 8)
    }
    return (
      emojiArray
        .map((obj) => ({
          ...obj,
          score: stringScore(obj.value, query)
        }))
        .sort((a, b) => (a.score < b.score ? 1 : -1))
        .slice(0, 6)
        // ":place of worship:" shouldn't pop up when i type ":poop"
        .filter((obj, _idx, arr) => obj.score > 0 && arr[0]?.score - obj.score < 0.3)
    )
  }

  static getDerivedStateFromProps(
    nextProps: Readonly<Props>,
    prevState: State
  ): Partial<State> | null {
    const {editorState, query} = nextProps
    if (query && query === prevState.query) return null
    const suggestedEmojis = EmojiMenu.filterByQuery(query)
    if (suggestedEmojis.length === 0) {
      nextProps.menuProps.closePortal()
      return null
    }
    return {
      // clicking on a menu will cause the editorStateSelection to lose focus, so we persist the last state before that point
      focusedEditorState: editorState.getSelection().getHasFocus()
        ? editorState
        : prevState.focusedEditorState,
      query,
      suggestedEmojis
    }
  }

  state: State = {
    focusedEditorState: null,
    suggestedEmojis: [],
    query: ''
  }

  render() {
    const {menuProps, menuRef, menuItemClickFactory} = this.props
    const {focusedEditorState} = this.state
    const {suggestedEmojis} = this.state
    return (
      <Menu ariaLabel={'Select the emoji'} {...menuProps} keepParentFocus ref={menuRef} tabReturns>
        {suggestedEmojis.map(({value, emoji}) => (
          <MenuItem
            key={value}
            label={`${emoji} ${value}`}
            onClick={menuItemClickFactory(emoji, focusedEditorState!)}
          />
        ))}
      </Menu>
    )
  }
}

export default EmojiMenu
