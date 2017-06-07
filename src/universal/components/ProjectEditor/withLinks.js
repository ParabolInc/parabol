import {EditorState, KeyBindingUtil} from 'draft-js';
import React, {Component} from 'react';
import EditorLinkChanger from 'universal/components/EditorLinkChanger/EditorLinkChanger';
import EditorLinkViewer from 'universal/components/EditorLinkViewer/EditorLinkViewer';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getSelectionLink from 'universal/components/ProjectEditor/getSelectionLink';
import getSelectionText from 'universal/components/ProjectEditor/getSelectionText';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import addSpace from 'universal/components/ProjectEditor/operations/addSpace';
import splitBlock from 'universal/components/ProjectEditor/operations/splitBlock';
import getDraftCoords from 'universal/utils/getDraftCoords';
import makeAddLink from 'universal/components/ProjectEditor/operations/makeAddLink';
import linkify from 'universal/utils/linkify';

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

    addHyperlink = (editorState) => {
      const selectionState = getCtrlKSelection(editorState);
      const text = getSelectionText(editorState, selectionState);
      const link = getSelectionLink(editorState, selectionState);
      this.setState({
        linkViewerData: undefined,
        linkChangerData: {
          link,
          text
        }
      });
    };

    // LinkChanger can take focus, so sometimes we don't want to blur
    removeModal = (allowFocus) => {
      const {linkChangerData} = this.state;
      if (!linkChangerData || allowFocus) {
        this.setState({
          linkViewerData: undefined,
          linkChangerData: undefined
        });
      }
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
        const targetRect = getDraftCoords();
        if (targetRect) {
          this.left = targetRect.left;
          this.top = targetRect.top + 32;
        }
        const renderModal = linkViewerData ? this.renderViewerModal : this.renderChangerModal;
        const {removeModal} = this;
        return {
          renderModal,
          removeModal
        };
      }
      return {};
    };

    renderChangerModal = ({editorState, setEditorState, editorRef}) => {
      const {linkChangerData} = this.state;
      const {text, link} = linkChangerData;
      return (
        <EditorLinkChanger
          isOpen
          top={this.top}
          left={this.left}
          editorState={editorState}
          setEditorState={setEditorState}
          removeModal={this.removeModal}
          linkData={linkChangerData}
          initialValues={{text, link}}
          editorRef={editorRef}
        />
      );
    };

    renderViewerModal = ({editorState, setEditorState}) => {
      const {linkViewerData} = this.state;
      const targetRect = getDraftCoords();
      if (!targetRect) {
        console.log('no target rect!')
      }
      return (
        <EditorLinkViewer
          isOpen
          top={targetRect && targetRect.top + 32}
          left={targetRect && targetRect.left}
          editorState={editorState}
          setEditorState={setEditorState}
          removeModal={this.removeModal}
          linkData={linkViewerData}
          addHyperlink={this.addHyperlink}
        />
      )
    };

    getMaybeLinkifiedState = (spacedEditorState, editorState) => {
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockText = block.getText();
      // -1 to remove the link from the current caret state
      const {begin, end, word} = getWordAt(blockText, anchorOffset - 1, true);
      const entityKey = block.getEntityAt(anchorOffset - 1);
      if (word && !entityKey) {
        const links = linkify.match(word);
        if (links) {
          const {url} = links[0];
          const linkifier = makeAddLink(block.getKey(), begin, end, url);
          this.undoLink = true;
          return linkifier(spacedEditorState);
        }
      }

      this.undoLink = undefined;

      // hitting space should close the modal
      if (this.props.renderModal) {
        this.props.removeModal();
      } else {
        const {linkViewerData, linkChangerData} = this.state;
        if (linkViewerData || linkChangerData) {
          this.removeModal();
        }
      }
      return spacedEditorState;
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
        const spacedEditorState = addSpace(editorState);
        const updatedEditorState = this.getMaybeLinkifiedState(spacedEditorState, editorState);
        setEditorState(updatedEditorState);
        // always handle this because we always want to break entities on whitespace, even mutable ones
        return 'handled';

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
        const spacedEditorState = splitBlock(editorState);
        const updatedEditorState = this.getMaybeLinkifiedState(spacedEditorState, editorState);
        setEditorState(updatedEditorState);
        return 'handled';
      }

      if (command === 'backspace' && this.undoLink) {
        setEditorState(EditorState.undo(editorState));
        this.undoLink = undefined;
        return 'handled';
      }

      if (command === 'add-hyperlink') {
        this.addHyperlink(editorState);
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
      if (e.key === 'k' && hasCommandModifier(e)) {
        return 'add-hyperlink';
      }
      return undefined;
    };

    handleChange = (editorState, setEditorState) => {
      const {handleChange} = this.props;
      const {linkChangerData, linkViewerData} = this.state;
      if (handleChange) {
        handleChange(editorState, setEditorState);
      }
      this.undoLink = undefined;
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const entityKey = block.getEntityAt(anchorOffset - 1);
      const inALink = entityKey && !linkChangerData && this.checkForLinks(editorState, entityKey);


      if (!inALink && linkViewerData) {
        this.removeModal()
      }
    };

    render() {
      const modalProps = this.initialize();
      return <ComposedComponent
        {...this.props}
        {...modalProps}
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
