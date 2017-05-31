import {Editor} from 'draft-js';
import React, {Component} from 'react';
import customStyleMap from './customStyleMap';
import handleKeyCommand from './handleKeyCommand';
import keyBindingFn from './keyBindingFn';
import emojiArray from 'universal/utils/emojiArray';

const LAST_NON_WHITESPACE = /\S+$/;
const FIRST_WHITESPACE = /\s/;

const getWordAtCaret = (editorState) => {
  const selection = editorState.getSelection();
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
  const startOffset = selection.getStartOffset();
  const fullBlockText = currentBlock.getText();
  const textToCaretLeft = fullBlockText.slice(0, startOffset);
  const wordStartIdx = textToCaretLeft.search(LAST_NON_WHITESPACE);
  if (wordStartIdx === -1) {
    return {};
  }
  const maybeWordEndIdx = fullBlockText.slice(wordStartIdx + 1).search(FIRST_WHITESPACE);
  const wordEndIdx = maybeWordEndIdx === -1 ? fullBlockText.length : maybeWordEndIdx;
  const word = fullBlockText.slice(wordStartIdx, wordStartIdx + wordEndIdx + 1);
  return {
    word,
    entity: currentBlock.getEntityAt(startOffset)
  }
};

  const emojiQuery = async (query) => {
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

  state = {};

  handleChange = (editorState) => {
    const {onChange} = this.props;
    const {word, entity} = getWordAtCaret(editorState);
    if (word && !entity) {
      if (word[0] === ':') {
        this.setState({
          modal: 'emoji',
          query: word.slice(1)
        });
        console.log('emoji trigger found!', entity, word);
      }
    }
    onChange(editorState);
  }

  handleKeyDown = (e) => {
    console.log('keydown', e.key);
  };

  render() {
    const {editorState, onChange, onBlur} = this.props;
    const {modal, query} = this.state;
    return (
      <div onKeyDown={this.handleKeyDown}>
        <Editor
          editorState={editorState}
          onChange={this.handleChange}
          onBlur={onBlur}
          keyBindingFn={keyBindingFn}
          customStyleMap={customStyleMap}
          handleKeyCommand={handleKeyCommand(onChange)}
          onKeyDown={this.handleKeyDown}
        />
        {/*{modal === 'emoji' &&*/}
          {/*<EmojiPicker query={query}/>*/}
        {/*}*/}
        {/*<EditorPortal isOpen={true}/>*/}
      </div>
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
