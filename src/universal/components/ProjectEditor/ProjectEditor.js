import {Editor, getDefaultKeyBinding} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import customStyleMap from './customStyleMap';
import withKeyboardShortcuts from './withKeyboardShortcuts';
import withLinks from './withLinks';
import withSuggestions from './withSuggestions';

class ProjectEditor extends Component {

  static propTypes = {
    onBlur: PropTypes.func,
    editorState: PropTypes.object,
    setEditorState: PropTypes.func,
    handleUpArrow: PropTypes.func,
    handleDownArrow: PropTypes.func,
    handleTab: PropTypes.func,
    handleReturn: PropTypes.func,
    renderModal: PropTypes.func,
    removeModal: PropTypes.func
  };

  state = {};

  removeModal = () => {
    const {removeModal} = this.props;
    if (removeModal) {
      removeModal();
    }
  };

  handleChange = (editorState) => {
    const {onBlur, setEditorState, handleChange, renderModal} = this.props;
    if (!editorState.getSelection().getHasFocus() && !renderModal) {
      onBlur(editorState);
      this.removeModal();
      return;
    }

    if (handleChange) {
      handleChange(editorState, setEditorState);
    }
    setEditorState(editorState);
  };

  handleUpArrow = (e) => {
    const {handleUpArrow, setEditorState, editorState} = this.props;
    if (handleUpArrow) {
      handleUpArrow(e, editorState, setEditorState);
    }
  };

  handleDownArrow = (e) => {
    const {handleDownArrow, setEditorState, editorState} = this.props;
    if (handleDownArrow) {
      handleDownArrow(e, editorState, setEditorState);
    }
  };

  handleTab = (e) => {
    const {handleTab, setEditorState, editorState} = this.props;
    if (handleTab) {
      handleTab(e, editorState, setEditorState);
    }
  };

  handleReturn = (e) => {
    const {handleReturn, setEditorState, editorState} = this.props;
    if (handleReturn) {
      return handleReturn(e, editorState, setEditorState);
    }
    return 'not-handled';
  };

  handleEscape = (e) => {
    e.preventDefault();
    this.removeModal();
  };

  handleKeyCommand = (command, editorState) => {
    const {handleKeyCommand, setEditorState} = this.props;
    if (handleKeyCommand) {
      return handleKeyCommand(command, editorState, setEditorState);
    }
  };

  keyBindingFn = (e) => {
    const {keyBindingFn} = this.props;
    if (keyBindingFn) {
      return keyBindingFn(e) || getDefaultKeyBinding(e);
    }
  };

  render() {
    const {editorState, setEditorState, renderModal, isDragging} = this.props;
    //console.log('ES', editorState.toJS())
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
          readOnly={isDragging}
          ref={(c) => {
            this.editorRef = c;
          }}
        />
        {renderModal && renderModal({editorState, setEditorState, editorRef: this.editorRef})}
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
