import {Editor, EditorState, getVisibleSelectionRect, Modifier} from 'draft-js';
import React, {Component} from 'react';
import stringScore from 'string-score';
import EmojiPicker from 'universal/components/EmojiPicker/EmojiPicker';
import emojiArray from 'universal/utils/emojiArray';
import customStyleMap from './customStyleMap';
import handleKeyCommand from './handleKeyCommand';
import keyBindingFn from './keyBindingFn';

const LAST_NON_WHITESPACE = /\S+$/;
const FIRST_WHITESPACE = /\s/;

const getWordAtCaret = (editorState) => {
  const selection = editorState.getSelection();
  if (!selection.getHasFocus()) return {blur: true};
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
  const startOffset = selection.getStartOffset();
  const fullBlockText = currentBlock.getText();
  const textToCaretLeft = fullBlockText.slice(0, startOffset);
  const wordStartIdx = textToCaretLeft.search(LAST_NON_WHITESPACE);
  if (wordStartIdx === -1) {
    return {};
  }
  const maybeWordEndOffset = fullBlockText.slice(wordStartIdx + 1).search(FIRST_WHITESPACE);
  const wordEndOffset = maybeWordEndOffset === -1 ? fullBlockText.length : maybeWordEndOffset;
  const wordEndIdx = wordStartIdx + wordEndOffset + 1;
  const word = fullBlockText.slice(wordStartIdx, wordEndIdx);
  return {
    start: wordStartIdx,
    end: wordEndIdx,
    nextChar: fullBlockText[wordEndIdx],
    word,
    entity: currentBlock.getEntityAt(startOffset)
  }
};

const resolveEmoji = async (query) => {
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
};

class ProjectEditor extends Component {

  state = {
    active: 0,
    suggestions: []
  };

  autoComplete = (mention) => {
    const {editorState, onChange} = this.props;
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const contentStateWithEntity = contentState
      .createEntity('EMOJI', 'IMMUTABLE', {emojiUnicode: mention});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const {start, end, nextChar} = getWordAtCaret(editorState);
    const emojiTextSelection = selectionState.merge({
      anchorOffset: start,
      focusOffset: end
    });
    //const stringToInsert = nextChar === ' ' ? mention : `${mention} `;
    const contentWithEmoji = Modifier.replaceText(
      contentState,
      emojiTextSelection,
      mention,
      null,
      entityKey
    );

    const newEditorState = EditorState.push(editorState, contentWithEmoji, 'insert-emoji');
    onChange(newEditorState);
    this.removeModal();
  };

  removeModal() {
    this.setState({
      modal: undefined
    })
  };

  handleChange = (editorState) => {
    const {onChange} = this.props;
    const {word, entity, blur} = getWordAtCaret(editorState);
    if (blur) {
      this.props.onBlur(editorState);
      this.removeModal();
      return;
    }
    if (word && !entity) {
      if (word[0] === ':') {
        const query = word.slice(1);
        this.setState({
          modal: 'emoji'
        });
        this.makeOptions(query, resolveEmoji);
      } else {
        this.removeModal();
      }
    } else {
      this.removeModal();
    }
    onChange(editorState);
  }

  handleUpArrow = (e) => {
    const {modal} = this.state;
    if (modal) {

      e.preventDefault();
      this.setState((state) => ({
        active: Math.max(state.active - 1, 0)
      }))
    }
  }

  handleDownArrow = (e) => {
    const {modal, suggestions} = this.state;
    if (modal) {
      e.preventDefault();
      this.setState((state) => ({
        active: Math.min(state.active + 1, suggestions.length - 1)
      }))
    }
  };

  handleEscape = (e) => {
    const {modal} = this.state;
    if (modal) {
      this.removeModal()
    }
  };

  handleReturn = (e) => {
    const {suggestions, active, modal} = this.state;
    if (modal) {
      e.preventDefault();
      const {value, emoji} = suggestions[active];
      this.autoComplete(emoji);
      return 'handled';
    }
    return 'not-handled';
  };

  makeOptions = async (query, resolve) => {
    const suggestions = await resolve(query);
    if (suggestions.length > 0) {
      const targetRect = getVisibleSelectionRect(window);
      this.setState({
        active: 0,
        suggestions,
        top: targetRect && targetRect.top + 32,
        left: targetRect && targetRect.left
      });
    } else {
      this.removeModal();
    }
  };

  handleItemClick = (idx) => (e) => {
    e.preventDefault();
    const {suggestions} = this.state;
    const item = suggestions[idx];
    this.autoComplete(item.emoji);
  };

  //https://github.com/facebook/draft-js/issues/494 DnD throws errors
  render() {
    const {editorState, onChange} = this.props;
    const {active, left, modal, suggestions, top} = this.state;
    return (
      <divs>
        <Editor
          editorState={editorState}
          onChange={this.handleChange}
          keyBindingFn={keyBindingFn}
          customStyleMap={customStyleMap}
          handleKeyCommand={handleKeyCommand(onChange, modal)}
          onUpArrow={this.handleUpArrow}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleReturn}
          handleReturn={this.handleReturn}
        />
        <EmojiPicker
          handleItemClick={this.handleItemClick}
          suggestions={suggestions}
          active={active}
          left={left}
          top={top}
          isOpen={modal === 'emoji'}
        />
      </divs>
    );
  }
}

export default ProjectEditor;

/*

 {/!*<this.EmojiSuggestions/>*!/}
 {/!*<this.MentionSuggestions*!/}
 {/!*entryComponent={TagSuggestion}*!/}
 {/!*onSearchChange={this.onSearchChange}*!/}
 {/!*suggestions={this.state.suggestions}*!/}
 {/!*onAddMention={this.onAddMention}*!/}
 {/!*!/>*!/}*/
