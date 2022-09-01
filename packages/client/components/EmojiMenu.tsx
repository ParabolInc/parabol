import React, {Component, Ref} from 'react'
import stringScore from 'string-score'
import {MenuProps} from '../hooks/useMenu'
import emojiArray from '../utils/emojiArray'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface EmojiSuggestion {
  value: string
  emoji: string
}

interface Props {
  menuProps: MenuProps
  onSelectEmoji: (emoji: string) => void
  menuRef?: Ref<any>
  query: string
}

interface State {
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
    const {query} = nextProps
    if (query && query === prevState.query) return null
    const suggestedEmojis = EmojiMenu.filterByQuery(query)
    if (suggestedEmojis.length === 0) {
      nextProps.menuProps.closePortal()
      return null
    }
    return {
      query,
      suggestedEmojis
    }
  }

  state: State = {
    suggestedEmojis: [],
    query: ''
  }

  render() {
    const {menuProps, menuRef, onSelectEmoji} = this.props
    const {suggestedEmojis} = this.state
    return (
      <Menu ariaLabel={'Select the emoji'} {...menuProps} keepParentFocus ref={menuRef} tabReturns>
        {suggestedEmojis.map(({value, emoji}) => (
          <MenuItem
            key={value}
            label={`${emoji} ${value}`}
            onClick={(e) => {
              e.preventDefault()
              onSelectEmoji(emoji)
            }}
          />
        ))}
      </Menu>
    )
  }
}

export default EmojiMenu
