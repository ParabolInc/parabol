import {getVisibleSelectionRect} from 'draft-js';
import React, {Component} from 'react';
import EditorSuggestions from 'universal/components/EditorSuggestions/EditorSuggestions';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import completeEntity, {autoCompleteEmoji} from 'universal/utils/draftjs/completeEnitity';
import resolvers from 'universal/components/ProjectEditor/resolvers';
import getAnchorLocation from './getAnchorLocation';
import stringScore from 'string-score';
import ui from 'universal/styles/ui';
import PropTypes from 'prop-types';

const withSuggestions = (ComposedComponent) => {
  class WithSuggestions extends Component {
    static propTypes = {
      handleUpArrow: PropTypes.func,
      handleDownArrow: PropTypes.func,
      editorState: PropTypes.object.isRequired,
      handleTab: PropTypes.func,
      handleReturn: PropTypes.func,
      handleChange: PropTypes.func,
      setEditorState: PropTypes.func.isRequired
    };

    state = {};

    handleUpArrow = (e) => {
      const {handleUpArrow} = this.props;
      if (handleUpArrow) {
        handleUpArrow(e);
      }
      e.preventDefault();
      const {active} = this.state;
      this.setState({
        active: Math.max(active - 1, 0)
      });
    };

    handleDownArrow = (e) => {
      const {handleDownArrow} = this.props;
      if (handleDownArrow) {
        handleDownArrow(e);
      }
      e.preventDefault();
      const {active, suggestions} = this.state;
      this.setState({
        active: Math.min(active + 1, suggestions.length - 1)
      });
    };


    handleSelect = (idx) => (e) => {
      const {editorState, setEditorState} = this.props;
      const {suggestions, suggestionType} = this.state;
      e.preventDefault();
      const item = suggestions[idx];
      if (suggestionType === 'tag') {
        const {name} = item;
        setEditorState(completeEntity(editorState, 'TAG', {value: name}, `#${name}`));
      } else if (suggestionType === 'emoji') {
        const unicode = item.emoji;
        setEditorState(autoCompleteEmoji(editorState, unicode));
      } else if (suggestionType === 'mention') {
        // team is derived from the project itself, so userId is the real useful thing here
        const [userId] = item.id;
        setEditorState(completeEntity(editorState, 'MENTION', {userId}, item.preferredName));
      }
      this.removeModal();
    };

    handleTab = (e) => {
      const {handleTab} = this.props;
      const {active} = this.state;
      if (handleTab) {
        handleTab(e);
      }
      this.handleSelect(active)(e);
    };

    handleReturn = (e) => {
      const {handleReturn} = this.props;
      const {active} = this.state;
      if (handleReturn) {
        handleReturn(e);
      }
      this.handleSelect(active)(e);
      return 'handled';
    };

    removeModal = () => {
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
      } else if (trigger === '@') {
        this.makeSuggestions(query, 'mention');
        return true;
      }
      return false;
    };

    resolveMentions = async (query) => {
      const {teamMembers} = this.props;
      if (!query) {
        return teamMembers.slice(0, 6);
      }
      return teamMembers.map((teamMember) => {
        const score = stringScore(teamMember.preferredName, query);
        return {
          ...teamMember,
          score
        };
      })
        .sort((a, b) => a.score < b.score ? 1 : -1)
        .slice(0, 6)
        .filter((obj, idx, arr) => obj.score > 0 && arr[0].score - obj.score < 0.3);
    };

    resolver = (resolveType) => {
      if (resolveType !== 'mention') {
        return resolvers[resolveType];
      }
      return this.resolveMentions;
    };

    makeSuggestions = async (query, resolveType) => {
      // setState before promise so we can add a spinner to the component
      // this.setState({
      //  suggestionType: resolveType,
      // });
      const resolve = this.resolver(resolveType);
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

    handleChange = (editorState) => {
      const {handleChange} = this.props;
      if (handleChange) {
        handleChange(editorState);
      }
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockText = block.getText();
      const entityKey = block.getEntityAt(anchorOffset - 1);
      const {word} = getWordAt(blockText, anchorOffset - 1);

      const inASuggestion = word && !entityKey && this.checkForSuggestions(word);
      const {suggestionType} = this.state;
      if (!inASuggestion && suggestionType) {
        this.removeModal();
      }
    }

    initialize = () => {
      const {suggestionType} = this.state;
      if (suggestionType) {
        const {renderModal, removeModal, handleUpArrow, handleDownArrow, handleTab, handleReturn} = this;
        return {renderModal, removeModal, handleUpArrow, handleDownArrow, handleTab, handleReturn};
      }
      return {};
    }

    renderModal = () => {
      const {active, suggestions, suggestionType} = this.state;
      const {editorState, setEditorState} = this.props;
      const targetRect = getVisibleSelectionRect(window);
      return (
        <EditorSuggestions
          isOpen
          active={active}
          suggestions={suggestions}
          suggestionType={suggestionType}
          top={targetRect && window.scrollY + targetRect.top + ui.draftModalMargin}
          left={targetRect && window.scrollX + targetRect.left}
          height={targetRect && targetRect.height}
          editorState={editorState}
          setEditorState={setEditorState}
          removeModal={this.removeModal}
          handleSelect={this.handleSelect}
        />
      );
    };

    render() {
      const modalProps = this.initialize();
      return (<ComposedComponent
        {...this.props}
        {...modalProps}
        handleChange={this.handleChange}
      />);
    }
  }
  return WithSuggestions;
};

export default withSuggestions;
