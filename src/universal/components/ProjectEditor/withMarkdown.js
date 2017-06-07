import {KeyBindingUtil} from 'draft-js';
import React, {Component} from 'react';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import maybeMarkdownify from 'universal/components/ProjectEditor/maybeMarkdownify';
import addSpace from 'universal/components/ProjectEditor/operations/addSpace';
import splitBlock from 'universal/components/ProjectEditor/operations/splitBlock';

const getCtrlKSelection = (editorState) => {
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) {
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const {word, begin, end} = getWordAt(blockText, anchorOffset - 1);

    if (word) {
      return selection.merge({
        anchorOffset: begin,
        focusOffset: end
      })
    }
  }
  return selection;
};

const {hasCommandModifier} = KeyBindingUtil;

const withLinks = (ComposedComponent) => {
  class WithLinks extends Component {
    state = {};

    handleKeyCommand = (command, editorState, setEditorState) => {
      const {handleKeyCommand} = this.props;
      const {undoMarkdown} = this.state;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command, editorState, setEditorState);
        if (result === 'handled' || result === true) {
          return result;
        }
      }

      if (command === 'space' || command === 'split-block') {
        const addWhiteSpace = command === 'space' ? addSpace : splitBlock;
        const applyMarkdown = maybeMarkdownify(editorState);
        const whitespacedEditorState = addWhiteSpace(editorState);
        if (applyMarkdown) {
          const {editorState: linkedEditorState, undoMarkdownify} = applyMarkdown(whitespacedEditorState);
          this.setState({
            undoMarkdown: undoMarkdownify
          });
          setEditorState(linkedEditorState);
        } else {
          // hitting space should close the modal
          if (this.props.renderModal) {
            this.props.removeModal();
          }
          setEditorState(whitespacedEditorState);
        }
        return 'handled';
      }

      if (command === 'backspace' && undoMarkdown) {
        console.log('handling backspace MD')
        setEditorState(undoMarkdown(editorState));
        this.setState({
          undoMarkdown: undefined
        });
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
        //return this.maybeLinkify(editorState, setEditorState);
      }
    };

    handleChange = (editorState, setEditorState) => {
      const {handleChange} = this.props;
      const {undoMarkdown} = this.state;
      if (handleChange) {
        handleChange(editorState, setEditorState);
      }
      //const {block, anchorOffset} = getAnchorLocation(editorState);
      //const entityKey = block.getEntityAt(anchorOffset - 1);
      //const inALink = entityKey && !linkChangerData && this.checkForLinks(editorState, entityKey);
      if (undoMarkdown) {
        this.setState({
          undoMarkdown: undefined
        })
      }
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
  return WithLinks;
};

export default withLinks;
