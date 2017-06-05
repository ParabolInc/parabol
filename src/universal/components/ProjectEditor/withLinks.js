import {EditorState, KeyBindingUtil, Modifier} from 'draft-js';
import React, {Component} from 'react';
import EditorLinkChanger from 'universal/components/EditorLinkChanger/EditorLinkChanger';
import EditorLinkViewer from 'universal/components/EditorLinkViewer/EditorLinkViewer';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import getWordAt from 'universal/components/ProjectEditor/getWordAt';
import maybeLinkify from './maybeLinkify';
import getDraftCoords from 'universal/utils/getDraftCoords';
import getSelectionText from 'universal/components/ProjectEditor/getSelectionText';

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
      //const targetRect = getDraftCoords();
      return (
        <EditorLinkChanger
          isOpen
          top={this.top}
          left={this.left}
          editorState={editorState}
          setEditorState={setEditorState}
          removeModal={this.removeModal}
          linkData={linkChangerData}
          initialValues={{text: linkChangerData.text}}
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
          // hitting space should close the modal
          if (this.props.renderModal) {
            this.props.removeModal();
          } else {
            const {linkViewerData, linkChangerData} = this.state;
            if (linkViewerData || linkChangerData) {
              this.removeModal();
            }
          }
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
        const text = getSelectionText(editorState, selectionState);
        //if (selectionState !== editorState.getSelection()) {
        //  setEditorState(EditorState.forceSelection(editorState, selectionState));
        //}
        console.log('current selectionState', selectionState.toJS(), `__${text}__`)
        // TODO if they ctrl + k a link, then grab the href of that
        this.setState({
          linkChangerData: {
            //href: '',
            selectionState,
            text,
            //initialValues: {
            //  text
            //}
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
      const entityKey = block.getEntityAt(anchorOffset - 1);
      const inALink = entityKey && this.checkForLinks(editorState, entityKey);
      const {linkViewerData, undoLink} = this.state;
      if (undoLink) {
        this.setState({
          undoLink: undefined
        })
      }

      if (!inALink && linkViewerData) {
        this.removeModal()
      }
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
