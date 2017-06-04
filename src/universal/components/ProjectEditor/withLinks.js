import {EditorState, getVisibleSelectionRect, KeyBindingUtil, Modifier} from 'draft-js';
import React, {Component} from 'react';
import EditorLinkViewer from 'universal/components/EditorLinkViewer/EditorLinkViewer';
import maybeLinkify from './maybeLinkify';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';

const {hasCommandModifier} = KeyBindingUtil;
const addSpace = (editorState) => {
  const contentState = Modifier.insertText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    ' '
  );
  return EditorState.push(editorState, contentState);
};

const splitBlock = (editorState) => {
  const contentState = Modifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection()
  );
  return EditorState.push(editorState, contentState, 'split-block');
};

const withLinks = (ComposedComponent) => {
  class WithLinks extends Component {
    state = {};

    removeModal = () => {
      //const {removeModal} = this.props;
      //if (removeModal) {
      //  removeModal();
      //}
      this.setState({
        linkData: undefined
      });
    };

    checkForLinks = (editorState, entityKey) => {
      const contentState = editorState.getCurrentContent();
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'LINK') {
        this.setState({
          linkData: entity.getData()
        });
        return true;
      }
      return false;
    };

    initialize = () => {
      const {linkData} = this.state;
      if (linkData) {
        const {renderModal, removeModal} = this;
        return {renderModal, removeModal};
      }
      return {};
    };

    renderModal = (editorState, onChange) => {
      const {linkData} = this.state;
      const targetRect = getVisibleSelectionRect(window);
      return (
        <EditorLinkViewer
          isOpen
          top={targetRect && targetRect.top + 32}
          left={targetRect && targetRect.left}
          editorState={editorState}
          onChange={onChange}
          removeModal={this.removeModal}
          linkData={linkData}
        />
      )
    };

    handleKeyCommand = (command, editorState, onChange) => {
      const {handleKeyCommand} = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command, editorState, onChange);
        if (result === 'handled' || result === true) {
          return result;
        }
      }

      const {undoLink} = this.state;
      if (command === 'space' || command === 'split-block') {
        const addWhiteSpace = command === 'space' ? addSpace : splitBlock;
        const linkifier = maybeLinkify(editorState);
        const whitespacedEditorState = addWhiteSpace(editorState);
        if (linkifier) {
          const {editorState: linkedEditorState, undoLinkify} = linkifier(whitespacedEditorState);
          this.setState({
            undoLink: undoLinkify
          });
          onChange(linkedEditorState);
        } else {
          onChange(whitespacedEditorState);
        }
        return 'handled';
      }

      if (command === 'backspace' && undoLink) {
        onChange(undoLink(editorState));
        return 'handled';
      }

      if (command === 'add-hyperlink') {
        this.setState({
          addingHyperlink: true
        });
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
      if (e.key === ' ') {
        // handleBeforeInput is buggy, let's just intercept space commands & handle them ourselves
        return 'space';
      } else if (e.key === 'k' && hasCommandModifier(e)) {
        return 'add-hyperlink';
      }
      return undefined;
    };

    handleChange = (editorState, onChange) => {
      const {handleChange} = this.props;
      if (handleChange) {
        handleChange(editorState, onChange);
      }
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const entityKey = block.getEntityAt(anchorOffset);
      if (entityKey) {
        this.checkForLinks(editorState, entityKey);
      } else {
        const {linkData} = this.state;
        if (linkData) {
          this.removeModal();
        }
      }
      onChange(editorState);
    };

    render() {
      const modalProps = this.initialize();
      return <ComposedComponent
        {...this.props}
        {...modalProps}
        handleChange={this.handleChange}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={this.keyBindingFn}
      />;
    }
  }
  return WithLinks;
};

export default withLinks;
