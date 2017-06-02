import {Editor, getVisibleSelectionRect} from 'draft-js';
import React, {Component} from 'react';
import EditorSuggestions from 'universal/components/EditorSuggestions/EditorSuggestions';
import MentionEmoji from 'universal/components/MentionEmoji/MentionEmoji';
import MentionTag from 'universal/components/MentionTag/MentionTag';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import customStyleMap from './customStyleMap';
import handleKeyCommand from './handleKeyCommand';
import completeEntity from 'universal/components/ProjectEditor/operations/completeEnitity';
import getAnchorLocation from './getAnchorLocation';
import keyBindingFn from './keyBindingFn';
import {resolveEmoji, resolveHashTag} from './resolvers';

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

  removeModal = () => {
    if (this.state.modal) {
      this.setState({
        modal: undefined
      })
    }
  };

  handleChange = (editorState) => {
    if (!editorState.getSelection().getHasFocus()) {
      this.props.onBlur(editorState);
      this.removeModal();
      return;
    }
    const {onChange} = this.props;
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const entity = block.getEntityAt(anchorOffset);
    const {word} = getWordAt(blockText, anchorOffset);
    if (word && !entity) {
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
    const {onChange, editorState} = this.props;
    if (modal === MentionTag) {
      const {name} = item;
      onChange(completeEntity(editorState, 'insert-tag', {value: name}, `#${name}`));
    } else if (modal === MentionEmoji) {
      const unicode = item.emoji;
      onChange(completeEntity(editorState, 'insert-emoji', {unicode}, unicode))
    }
    this.removeModal();
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