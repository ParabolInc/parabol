import {RichUtils} from 'draft-js';
import React, {Component} from 'react';
import {KeyBindingUtil} from 'draft-js';
import PropTypes from 'prop-types';

const {hasCommandModifier} = KeyBindingUtil;

const withKeyboardShortcuts = (ComposedComponent) => {
  class WithKeyboardShortcuts extends Component {
    static propTypes = {
      editorState: PropTypes.object.isRequired,
      handleKeyCommand: PropTypes.func,
      keyBindingFn: PropTypes.func,
      setEditorState: PropTypes.func.isRequired
    };

    handleKeyCommand = (command) => {
      const {handleKeyCommand, editorState, setEditorState} = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command);
        if (result === 'handled' || result === true) {
          return result;
        }
      }

      if (command === 'strikethrough') {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'));
        return 'handled';
      }

      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        setEditorState(newState);
        return 'handled';
      }
      return 'not-handled';
    };

    keyBindingFn = (e) => {
      const {keyBindingFn} = this.props;
      if (keyBindingFn) {
        const result = keyBindingFn(e);
        if (result) {
          return result;
        }
      }
      if (e.key === 'X' && hasCommandModifier(e)) {
        return 'strikethrough';
      }
      return undefined;
    };

    render() {
      return (<ComposedComponent
        {...this.props}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={this.keyBindingFn}
      />);
    }
  }
  return WithKeyboardShortcuts;
};

export default withKeyboardShortcuts;
