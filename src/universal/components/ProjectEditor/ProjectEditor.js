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
import EditorLinkViewer from 'universal/components/EditorLinkViewer/EditorLinkViewer';

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
    const {suggestionModal, linkModalData} = this.state;
    if (suggestionModal || linkModalData) {
      this.setState({
        suggestionModal: undefined,
        linkModalData: undefined
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
    const entityKey = block.getEntityAt(anchorOffset);
    const {word} = getWordAt(blockText, anchorOffset);
    if (word && !entityKey) {
      const trigger = word[0];
      const query = word.slice(1);
      if (trigger === ':') {
        this.setState({
          suggestionModal: MentionEmoji
        });
        this.makeOptions(query, resolveEmoji);
      } else if (trigger === '#') {
        this.setState({
          suggestionModal: MentionTag
        });
        this.makeOptions(query, resolveHashTag);
      } else {
        this.removeModal();
      }
    } else if (entityKey) {
      const contentState = editorState.getCurrentContent();
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'LINK') {
        const targetRect = getVisibleSelectionRect(window);
        this.setState({
          linkModalData: entity.getData(),
          top: targetRect && targetRect.top + 32,
          left: targetRect && targetRect.left
        });
      } else {
        this.removeModal();
      }
    } else {
      this.removeModal();
    }

    onChange(editorState);
  }

  handleUpArrow = (e) => {
    const {suggestionModal} = this.state;
    if (suggestionModal) {

      e.preventDefault();
      this.setState((state) => ({
        active: Math.max(state.active - 1, 0)
      }))
    }
  }

  handleDownArrow = (e) => {
    const {suggestionModal, suggestions} = this.state;
    if (suggestionModal) {
      e.preventDefault();
      this.setState((state) => ({
        active: Math.min(state.active + 1, suggestions.length - 1)
      }))
    }
  };

  handleEscape = (e) => {
    const {suggestionModal} = this.state;
    if (suggestionModal) {
      this.removeModal()
    }
  };

  handleReturn = (e) => {
    const {suggestions, active, suggestionModal} = this.state;
    if (suggestionModal) {
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
    const {suggestionModal, suggestions} = this.state;
    const item = suggestions[idx];
    const {onChange, editorState} = this.props;
    if (suggestionModal === MentionTag) {
      const {name} = item;
      onChange(completeEntity(editorState, 'insert-tag', {value: name}, `#${name}`));
    } else if (suggestionModal === MentionEmoji) {
      const unicode = item.emoji;
      onChange(completeEntity(editorState, 'insert-emoji', {unicode}, unicode))
    }
    this.removeModal();
  };

  //https://github.com/facebook/draft-js/issues/494 DnD throws errors
  render() {
    const {editorState, onChange} = this.props;
    const {active, left, linkModalData, suggestionModal, suggestions, top} = this.state;
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
          isOpen={Boolean(suggestionModal)}
          mention={suggestionModal}
        />
        <EditorLinkViewer
          isOpen={Boolean(linkModalData)}
          entityData={linkModalData}
          left={left}
          top={top}
          editorState={editorState}
          onChange={onChange}
          removeModal={this.removeModal}
        />
      </divs>
    );
  }
}

export default ProjectEditor;