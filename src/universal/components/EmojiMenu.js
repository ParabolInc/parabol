// @flow
import * as React from 'react';
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts';
import stringScore from 'string-score';
import emojiArray from 'universal/utils/emojiArray';
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts';
import dontTellDraft from 'universal/utils/draftjs/dontTellDraft';

const {Component} = React;

type EmojiSuggestion = {
  value: string,
  emoji: string
};

type Props = {
  closePortal: () => void,
  editorState: Object,
  menuItemClickFactory: (emoji: string, editorState: ?Object) => () => void,
  menuRef: () => void,
  query: string
};

type State = {
  focusedEditorState: ?Object,
  suggestedEmojis: Array<EmojiSuggestion>,
  query: string
}

class EmojiMenu extends Component<Props, State> {
  static filterByQuery(query: string) {
    if (!query) {
      return emojiArray.slice(2, 8);
    }
    return emojiArray.map((obj) => ({
      ...obj,
      score: stringScore(obj.value, query)
    }))
      .sort((a, b) => a.score < b.score ? 1 : -1)
      .slice(0, 6)
      // ":place of worship:" shouldn't pop up when i type ":poop"
      .filter((obj, idx, arr) => obj.score > 0 && arr[0].score - obj.score < 0.3);
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {editorState, query} = nextProps;
    if (query && query === prevState.query) return null;
    return {
      // clicking on a menu will cause the editorStateSelection to lose focus, so we persist the last state before that point
      focusedEditorState: editorState.getSelection().getHasFocus() ? editorState : prevState.focusedEditorState,
      query,
      suggestedEmojis: EmojiMenu.filterByQuery(query)
    };
  }

  state = {
    focusedEditorState: null,
    suggestedEmojis: [],
    query: ''
  };

  render() {
    const {closePortal, menuRef, menuItemClickFactory} = this.props;
    const {focusedEditorState} = this.state;
    const {suggestedEmojis} = this.state;
    return (
      <MenuWithShortcuts
        ariaLabel={'Select the emoji'}
        closePortal={closePortal}
        keepParentFocus
        onMouseDown={dontTellDraft}
        ref={menuRef}
        tabReturns
      >
        {suggestedEmojis.map(({value, emoji}) => (
          <MenuItemWithShortcuts
            key={value}
            label={`${emoji} ${value}`}
            onClick={menuItemClickFactory(emoji, focusedEditorState)}
          />
        ))}
      </MenuWithShortcuts>
    );
  }
}

export default EmojiMenu;
