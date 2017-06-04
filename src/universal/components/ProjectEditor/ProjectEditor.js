import {Editor} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import customStyleMap from './customStyleMap';
import withKeyboardShortcuts from './withKeyboardShortcuts';
import withLinks from './withLinks';
import withSuggestions from './withSuggestions';
import {getDefaultKeyBinding} from 'draft-js';

class ProjectEditor extends Component {

  static propTypes = {
    onBlur: PropTypes.func,
    editorState: PropTypes.object,
    onChange: PropTypes.func,
    handleUpArrow: PropTypes.func,
    handleDownArrow: PropTypes.func,
    handleTab: PropTypes.func,
    handleReturn: PropTypes.func,
    renderModal: PropTypes.func,
    removeModal: PropTypes.func
  };

  state = {};

  componentWillReceiveProps(nextProps) {
    const {undoLink} = this.state;
    // the ability to hit backspace to undo linkification goes away after a click or keypress
    if (undoLink && this.props.editorState !== nextProps.editorState) {
      this.setState({
        undoLink: undefined
      });
    }
  }

  removeModal = () => {
    const {removeModal} = this.props;
    if (removeModal) {
      removeModal();
    }
  };

  handleChange = (editorState) => {
    const {onBlur, onChange, handleChange} = this.props;
    if (!editorState.getSelection().getHasFocus()) {
      onBlur(editorState);
      this.removeModal();
      return;
    }

    if (handleChange) {
      handleChange(editorState, onChange);
    } else {
      onChange(handleChange);
    }
  };

  handleUpArrow = (e) => {
    const {handleUpArrow, onChange, editorState} = this.props;
    if (handleUpArrow) {
      handleUpArrow(e, editorState, onChange);
    }
  };

  handleDownArrow = (e) => {
    const {handleDownArrow, onChange, editorState} = this.props;
    if (handleDownArrow) {
      handleDownArrow(e, editorState, onChange);
    }
  };

  handleTab = (e) => {
    const {handleTab, onChange, editorState} = this.props;
    if (handleTab) {
      handleTab(e, editorState, onChange);
    }
  };

  handleReturn = (e) => {
    const {handleReturn, onChange, editorState} = this.props;
    if (handleReturn) {
      return handleReturn(e, editorState, onChange);
    }
    return 'not-handled';
  };

  handleEscape = (e) => {
    e.preventDefault();
    const {renderModal} = this.state;
    if (renderModal) {
      this.removeModal();
    }
  };

  handleKeyCommand = (command, editorState) => {
    const {handleKeyCommand, onChange} = this.props;
    if (handleKeyCommand) {
      return handleKeyCommand(command, editorState, onChange);
    }
  };

  keyBindingFn = (e) => {
    const {keyBindingFn} = this.props;
    if (keyBindingFn) {
      return keyBindingFn(e) || getDefaultKeyBinding(e);
    }
  };
  // https://github.com/facebook/draft-js/issues/494 DnD throws errors
  render() {
    const {editorState, onChange, renderModal} = this.props;
    return (
      <div>
        <Editor
          editorState={editorState}
          onChange={this.handleChange}
          keyBindingFn={this.keyBindingFn}
          customStyleMap={customStyleMap}
          handleKeyCommand={this.handleKeyCommand}
          onUpArrow={this.handleUpArrow}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleTab}
          handleReturn={this.handleReturn}
        />
        {renderModal && renderModal(editorState, onChange)}
      </div>
    );
  }
}

export default
withSuggestions(
  withLinks(
    withKeyboardShortcuts(
      ProjectEditor
    )
  )
);
