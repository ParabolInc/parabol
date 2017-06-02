import {Editor, EditorState, getVisibleSelectionRect, Modifier} from 'draft-js';

import React, {Component} from 'react';
import stringScore from 'string-score';
import EditorSuggestions from 'universal/components/EditorSuggestions/EditorSuggestions';
import MentionEmoji from 'universal/components/MentionEmoji/MentionEmoji';
import MentionTag from 'universal/components/MentionTag/MentionTag';
import {tags} from 'universal/utils/constants';
import emojiArray from 'universal/utils/emojiArray';
import customStyleMap from './customStyleMap';
import getWordAtCaret from './getWordAtCaret';
import handleKeyCommand from './handleKeyCommand';
import keyBindingFn from './keyBindingFn';

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

const resolveHashTag = async (query) => {
  return tags.filter((tag) => tag.name.startsWith(query));
};

class ProjectEditor extends Component {

  constructor(props) {
    super(props);
    this.handleKeyCommand = handleKeyCommand.bind(this);
  }

  state = {
    active: 0,
    suggestions: []
  };

  componentWillReceiveProps(nextProps) {
    const {undoLink} = this.state;
    // the ability to hit backspace to undo linkification goes away after a click or keypress
    if (undoLink && this.props.editorState !== nextProps.editorState) {
      this.setState({
        undoLink: undefined
      })
    }
  }

  autoCompleteEmoji = (mention) => {
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

  autoCompleteHashTag = (mention) => {
    const {editorState, onChange} = this.props;
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const contentStateWithEntity = contentState
      .createEntity('TAG', 'IMMUTABLE', {value: mention});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const {start, end} = getWordAtCaret(editorState);
    const emojiTextSelection = selectionState.merge({
      anchorOffset: start,
      focusOffset: end
    });
    //const stringToInsert = nextChar === ' ' ? mention : `${mention} `;
    const contentWithTag = Modifier.replaceText(
      contentState,
      emojiTextSelection,
      `#${mention}`,
      null,
      entityKey
    );

    const newEditorState = EditorState.push(editorState, contentWithTag, 'insert-tag');
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
    const {word, lastWord, entity, blur, start, end} = getWordAtCaret(editorState);
    if (blur) {
      this.props.onBlur(editorState);
      this.removeModal();
      return;
    }
    if (word) {
      if (!entity) {
        const trigger = word[0];
        const query = word.slice(1);
        if (trigger === ':') {
          this.setState({
            modal: MentionEmoji
          });
          this.makeOptions(query, resolveEmoji);
        } else if (trigger === '#') {
          this.setState({
            modal: MentionTag
          });
          this.makeOptions(query, resolveHashTag);
        } else {
          this.removeModal();
        }
      } else {
        this.removeModal();
      }
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
      this.handleItemClick(active)();
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
    if (e) {
      e.preventDefault();
    }
    const {modal, suggestions} = this.state;
    const item = suggestions[idx];
    switch (modal) {
      case MentionTag:
        this.autoCompleteHashTag(item.name);
        return;
      case MentionEmoji:
        this.autoCompleteEmoji(item.emoji);
        return;
      default:
        return;
    }
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
          handleKeyCommand={this.handleKeyCommand}
          onUpArrow={this.handleUpArrow}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleReturn}
          handleReturn={this.handleReturn}
        />
        <EditorSuggestions
          handleItemClick={this.handleItemClick}
          suggestions={suggestions}
          active={active}
          left={left}
          top={top}
          isOpen={Boolean(modal)}
          mention={modal}
        />
      </divs>
    );
  }
}

export default ProjectEditor;