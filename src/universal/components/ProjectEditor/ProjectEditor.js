import {Editor, getVisibleSelectionRect} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import EditorLinkViewer from 'universal/components/EditorLinkViewer/EditorLinkViewer';

import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import customStyleMap from './customStyleMap';
import getAnchorLocation from './getAnchorLocation';
import handleKeyCommand from './handleKeyCommand';
import keyBindingFn from './keyBindingFn';
import withSuggestions from './withSuggestions';

class ProjectEditor extends Component {

  static propTypes = {
    onBlur: PropTypes.func,
    editorState: PropTypes.object,
    onChange: PropTypes.func,
    checkForSuggestions: PropTypes.func,
    handleUpArrow: PropTypes.func,
    handleDownArrow: PropTypes.func,
    handleTab: PropTypes.func,
    handleReturn: PropTypes.func,
    renderModal: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.handleKeyCommand = handleKeyCommand.bind(this);
  }

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

  handleChange = (editorState) => {
    const {onBlur, onChange, checkForSuggestions} = this.props;
    if (!editorState.getSelection().getHasFocus()) {
      onBlur(editorState);
      this.removeModal();
      return;
    }
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const entityKey = block.getEntityAt(anchorOffset);
    const {word} = getWordAt(blockText, anchorOffset);
    let handled;
    if (word && !entityKey) {
      handled = checkForSuggestions(word);
    } else if (!handled && entityKey) {
      const contentState = editorState.getCurrentContent();
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'LINK') {
        const targetRect = getVisibleSelectionRect(window);
        this.setState({
          modalComponent: EditorLinkViewer,
          modalData: {
            entityData: entity.getData(),
            top: targetRect && targetRect.top + 32,
            left: targetRect && targetRect.left
          }
        });
        onChange(editorState);
        return;
      }
    }
    if (!handled) {
      this.removeModal();
    }
    onChange(editorState);
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

  // https://github.com/facebook/draft-js/issues/494 DnD throws errors
  render() {
    const {editorState, onChange, renderModal} = this.props;
    return (
      <div>
        <Editor
          editorState={editorState}
          onChange={this.handleChange}
          keyBindingFn={keyBindingFn}
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

export default withSuggestions(ProjectEditor);
