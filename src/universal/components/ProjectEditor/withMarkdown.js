import {EditorState, Modifier} from 'draft-js';
import {OrderedSet} from 'immutable';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import addSpace from 'universal/components/ProjectEditor/operations/addSpace';
import splitBlock from 'universal/components/ProjectEditor/operations/splitBlock';

const inlineMatchers = {
  ITALIC: {regex: /(\*\*|__)(.*?)\1/, matchIdx: 2},
  BOLD: {regex: /([\*_])(.*?)\1/, matchIdx: 2},
  CODE: {regex: /`([^`]+)`/, matchIdx: 2},
  STRIKETHROUGH: {regex: /(~+)([^~\s]+)\1/, matchIdx: 2}
};

const styles = Object.keys(inlineMatchers);

const extractStyle = (editorState, getNextState, style, blockKey, extractedStyles) => {
  const {regex, matchIdx} = inlineMatchers[style];
  const blockText = editorState.getCurrentContent().getBlockForKey(blockKey).getText();
  const result = regex.exec(blockText);
  if (result) {
    extractedStyles.push(style);
    const es = extractedStyles.length === 1 ? getNextState() : editorState;
    const contentState = es.getCurrentContent();
    const selectionState = es.getSelection();
    const beforePhrase = result[0];
    const afterPhrase = result[matchIdx];
    const selectionToReplace = selectionState.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: result.index,
      focusOffset: result.index + beforePhrase.length
    });

    const phraseShrink = beforePhrase.length - afterPhrase.length;
    // if it's a split block, then go to 0
    const nextCaret = selectionState.getAnchorKey() === blockKey ? selectionState.getFocusOffset() - phraseShrink : 0;
    const selectionAfter = selectionState.merge({
      anchorOffset: nextCaret,
      focusOffset: nextCaret
    });

    const markdownedContent = Modifier.replaceText(
      contentState,
      selectionToReplace,
      afterPhrase,
      OrderedSet.of(...extractedStyles)
    ).merge({
      selectionAfter,
    });
    return EditorState.push(es, markdownedContent, 'change-inline-style');
  }
  return editorState
};

const extractMarkdownStyles = (editorState, getNextState, blockKey) => {
  const extractedStyles = [];
  let es = editorState;
  for (let i = 0; i < styles.length; i++) {
    es = extractStyle(es, getNextState, styles[i], blockKey, extractedStyles);
  }
  if (es !== editorState) {
    // squash the undo stack so hitting undo (or transitively backspace) undoes all the styling
    const undoStack = es.getUndoStack();
    return EditorState.set(es, {
      undoStack: undoStack.slice(extractedStyles.length - 1),
      currentContent: es.getCurrentContent().merge({
        selectionBefore: undoStack.get(extractedStyles.length - 1).getSelectionAfter()
      }),
      inlineStyleOverride: OrderedSet()
    });
  }
}

const doUndo = (editorState, count) => {
  const nextEditorState = EditorState.undo(editorState);
  return count === 1 ? nextEditorState : doUndo(nextEditorState, count -1);
}
const withLinks = (ComposedComponent) => {
  return class WithMarkdown extends Component {
    static propTypes = {
      removeModal: PropTypes.func,
      renderModal: PropTypes.func,
      handleBeforeInput: PropTypes.func,
      handleChange: PropTypes.func,
      handleKeyCommand: PropTypes.func,
      keyBindingFn: PropTypes.func
    };

    state = {};

    getMaybeMarkdownState = (getNextState, editorState) => {
      this.undoMarkdown = undefined;
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockKey = block.getKey();
      const entityKey = block.getEntityAt(anchorOffset - 1);
      if (!entityKey) {
        const result = extractMarkdownStyles(editorState, getNextState, blockKey);
        if (result) {
          console.log('res', result)
          this.undoMarkdown = true;
          return result;
        }
      }
    };

    handleKeyCommand = (command, editorState, setEditorState) => {
      const {handleKeyCommand} = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command, editorState, setEditorState);
        if (result === 'handled' || result === true) {
          return result;
        }
      }

      if (command === 'split-block') {
        const getNextState = () => splitBlock(editorState);
        const updatedEditorState = this.getMaybeMarkdownState(getNextState, editorState);
        if (updatedEditorState) {
          setEditorState(updatedEditorState);
          return 'handled';
        }
      }

      if (command === 'backspace' && this.undoMarkdown) {
        setEditorState(EditorState.undo(editorState));
        this.undoMarkdown = undefined;
        return 'handled';
      }
    };

    keyBindingFn = (e) => {
      const {keyBindingFn} = this.props;
      if (keyBindingFn) {
        const result = keyBindingFn(e);
        if (result) {
          return result;
        }
      }
      if (e.key === ' ') {
        // handleBeforeInput is buggy, let's just intercept space commands & handle them ourselves
        //return 'space';
      }
      return undefined;
    };

    handleBeforeInput = (char, editorState, setEditorState) => {
      const {handleBeforeInput} = this.props;
      if (handleBeforeInput) {
        const result = handleBeforeInput(char, editorState, setEditorState);
        if (result === 'handled' || result === true) {
          return result;
        }
      }
      if (char === ' ') {
        const getNextState = () => addSpace(editorState);
        const updatedEditorState = this.getMaybeMarkdownState(getNextState, editorState);
        if (updatedEditorState) {
          setEditorState(updatedEditorState);
          return 'handled';
        }

        return undefined;
      }
    };

    handleChange = (editorState, setEditorState) => {
      const {handleChange} = this.props;
      if (handleChange) {
        handleChange(editorState, setEditorState);
      }
      this.undoMarkdown = undefined;
    };

    render() {
      return <ComposedComponent
        {...this.props}
        handleBeforeInput={this.handleBeforeInput}
        handleChange={this.handleChange}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={this.keyBindingFn}
      />;
    }
  }
};

export default withLinks;
