import {getVisibleSelectionRect} from 'draft-js';
import React, {Component} from 'react';
import EditorSuggestions from 'universal/components/EditorSuggestions/EditorSuggestions';
import completeEntity from 'universal/components/ProjectEditor/operations/completeEnitity';
import resolvers from 'universal/components/ProjectEditor/resolvers';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import getAnchorLocation from './getAnchorLocation';

const withSuggestions = (ComposedComponent) => {
  class WithSuggestions extends Component {
    state = {};

    handleUpArrow = (e, editorState, onChange) => {
      const {handleUpArrow} = this.props;
      if (handleUpArrow) {
        handleUpArrow(e, editorState, onChange);
      }
      e.preventDefault();
      const {active} = this.state;
      this.setState({
        active: Math.max(active - 1, 0)
      });
    };

    handleDownArrow = (e, editorState, onChange) => {
      const {handleDownArrow} = this.props;
      if (handleDownArrow) {
        handleDownArrow(e, editorState, onChange);
      }
      e.preventDefault();
      const {active, suggestions} = this.state;
      this.setState({
        active: Math.min(active + 1, suggestions.length - 1)
      })
    };


    handleSelect = (e, editorState, onChange) => {
      const {active, suggestions, suggestionType} = this.state;
      e.preventDefault();
      const item = suggestions[active];
      if (suggestionType === 'tag') {
        const {name} = item;
        onChange(completeEntity(editorState, 'insert-tag', {value: name}, `#${name}`));
      } else if (suggestionType === 'emoji') {
        const unicode = item.emoji;
        onChange(completeEntity(editorState, 'insert-emoji', {unicode}, unicode))
      }
      this.removeModal();
    };

    handleTab = (e, editorState, onChange) => {
      const {handleTab} = this.props;
      if (handleTab) {
        handleTab(e, editorState, onChange);
      }
      this.handleSelect(e, editorState, onChange);
    };

    handleReturn = (e, editorState, onChange) => {
      const {handleReturn} = this.props;
      if (handleReturn) {
        handleReturn(e, editorState, onChange);
      }
      this.handleSelect(e, editorState, onChange);
      return 'handled';
    };

    removeModal = () => {
      const {removeModal} = this.props;
      if (removeModal) {
        removeModal();
      }
      this.setState({
        active: undefined,
        suggestions: undefined,
        suggestionType: undefined
      });
    };

    checkForSuggestions = (word) => {
      const trigger = word[0];
      const query = word.slice(1);
      if (trigger === ':') {
        this.makeSuggestions(query, 'emoji');
        return true;
      } else if (trigger === '#') {
        this.makeSuggestions(query, 'tag');
        return true;
      }
      return false;
    };

    makeSuggestions = async (query, resolveType) => {
      // setState before promise so we can add a spinner to the component
      //this.setState({
      //  suggestionType: resolveType,
      //});
      const resolve = resolvers[resolveType];
      const suggestions = await resolve(query);
      if (suggestions.length > 0) {
        this.setState({
          active: 0,
          suggestions,
          suggestionType: resolveType
        });
      } else {
        this.removeModal();
      }
    };

    handleChange = (editorState, onChange) => {
      const {handleChange} = this.props;
      if (handleChange) {
        handleChange(editorState, onChange);
      }
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockText = block.getText();
      const entityKey = block.getEntityAt(anchorOffset);
      const {word} = getWordAt(blockText, anchorOffset);

      if (word && !entityKey) {
        this.checkForSuggestions(word);
      } else {
        const {suggestionType} = this.state;
        if (suggestionType) {
          this.removeModal();
        }
      }
      onChange(editorState);
    }

    initialize = () => {
      const {suggestionType} = this.state;
      if (suggestionType) {
        const {renderModal, removeModal, handleUpArrow, handleDownArrow, handleTab, handleReturn} = this;
        return {renderModal, removeModal, handleUpArrow, handleDownArrow, handleTab, handleReturn};
      }
      return {};
    }

    renderModal = (editorState, onChange) => {
      const {active, suggestions, suggestionType} = this.state;
      const targetRect = getVisibleSelectionRect(window);
      return (
        <EditorSuggestions
          isOpen
          active={active}
          suggestions={suggestions}
          suggestionType={suggestionType}
          top={targetRect && targetRect.top + 32}
          left={targetRect && targetRect.left}
          editorState={editorState}
          onChange={onChange}
          removeModal={this.removeModal}
          handleSelect={this.handleSelect}
        />
      )
    };

    render() {
      const modalProps = this.initialize();
      if (Object.keys(modalProps) > 0) {
      }

      return <ComposedComponent
        {...this.props}
        {...modalProps}
        handleChange={this.handleChange}
      />;
    }
  }
  return WithSuggestions;
};

export default withSuggestions;
