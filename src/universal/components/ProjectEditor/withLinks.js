import {EditorState, getVisibleSelectionRect, KeyBindingUtil, Modifier} from 'draft-js';
import React, {Component} from 'react';
import EditorLinkViewer from 'universal/components/EditorLinkViewer/EditorLinkViewer';
import EditorLinkChanger from 'universal/components/EditorLinkChanger/EditorLinkChanger';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import maybeLinkify from './maybeLinkify';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';

const getCtrlKSelection = (editorState) => {
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) {
    const {block, anchorOffset} = getAnchorLocation(editorState);
    const blockText = block.getText();
    const {word, begin, end} = getWordAt(blockText, anchorOffset);

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
      this.setState({
        linkViewerData: undefined,
        linkChangerData: undefined
      });
    };

    checkForLinks = (editorState, entityKey) => {
      const contentState = editorState.getCurrentContent();
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'LINK') {
        this.setState({
          linkViewerData: entity.getData()
        });
        return true;
      }
      return false;
    };

    initialize = () => {
      const {linkViewerData, linkChangerData} = this.state;
      if (linkViewerData || linkChangerData) {
        const renderModal = linkViewerData ? this.renderViewerModal : this.renderChangerModal;
        const {removeModal} = this;
        return {
          renderModal,
          removeModal
        };
      }
      return {};
    };

    renderChangerModal = (editorState, setEditorState) => {
      const {linkChangerData} = this.state;
      const targetRect = getVisibleSelectionRect(window);
      return (
        <EditorLinkChanger
          isOpen
          top={targetRect && targetRect.top + 32}
          left={targetRect && targetRect.left}
          editorState={editorState}
          setEditorState={setEditorState}
          removeModal={this.removeModal}
          linkData={linkChangerData}
        />
      );
    };

    renderViewerModal = (editorState, setEditorState) => {
      const {linkViewerData} = this.state;
      const targetRect = getVisibleSelectionRect(window);
      return (
        <EditorLinkViewer
          isOpen
          top={targetRect && targetRect.top + 32}
          left={targetRect && targetRect.left}
          editorState={editorState}
          setEditorState={setEditorState}
          removeModal={this.removeModal}
          linkData={linkViewerData}
        />
      )
    };

    handleKeyCommand = (command, editorState, setEditorState) => {
      const {handleKeyCommand} = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command, editorState, setEditorState);
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
          setEditorState(linkedEditorState);
        } else {
          setEditorState(whitespacedEditorState);
        }
        return 'handled';
      }

      if (command === 'backspace' && undoLink) {
        setEditorState(undoLink(editorState));
        this.setState({
          undoLink: undefined
        });
        return 'handled';
      }

      if (command === 'add-hyperlink') {
        const selectionState = getCtrlKSelection(editorState);
        if (selectionState !== editorState.getSelection()) {
          setEditorState(EditorState.forceSelection(editorState, selectionState));
        }
        // TODO if they ctrl + k a link, then grab the href of that
        this.setState({
          linkChangerData: {
            //href: '',
            selectionState
          }
        })
        //this.setState({
        //  addingHyperlink: true
        //});
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

    handleChange = (editorState, setEditorState) => {
      const {handleChange} = this.props;
      if (handleChange) {
        handleChange(editorState, setEditorState);
      }
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const entityKey = block.getEntityAt(anchorOffset);
      if (entityKey) {
        this.checkForLinks(editorState, entityKey);
      } else {
        const {linkViewerData} = this.state;
        if (linkViewerData) {
          this.removeModal();
        }
      }
      setEditorState(editorState);
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
