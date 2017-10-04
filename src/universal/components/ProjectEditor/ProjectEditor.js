import {css} from 'aphrodite-local-styles/no-important';
import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withMarkdown from 'universal/components/ProjectEditor/withMarkdown';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {textTags} from 'universal/utils/constants';
import entitizeText from 'universal/utils/draftjs/entitizeText';
import './Draft.css';
import withKeyboardShortcuts from './withKeyboardShortcuts';
import withLinks from './withLinks';
import withSuggestions from './withSuggestions';

class ProjectEditor extends Component {
  static propTypes = {
    editorRef: PropTypes.any,
    editorState: PropTypes.object,
    setEditorState: PropTypes.func,
    trackEditingComponent: PropTypes.func,
    handleBeforeInput: PropTypes.func,
    handleChange: PropTypes.func,
    handleUpArrow: PropTypes.func,
    handleDownArrow: PropTypes.func,
    handleKeyCommand: PropTypes.func,
    handleTab: PropTypes.func,
    handleReturn: PropTypes.func,
    readOnly: PropTypes.bool,
    keyBindingFn: PropTypes.func,
    renderModal: PropTypes.func,
    removeModal: PropTypes.func,
    setEditorRef: PropTypes.func.isRequired,
    styles: PropTypes.object
  };

  state = {};

  componentDidMount() {
    const {editorState} = this.props;
    if (!editorState.getCurrentContent().hasText()) {
      setTimeout(() => {
        // don't pull it from this.props above because react will mutate this.props to our advantage
        const {editorRef} = this.props;
        try {
          editorRef.focus();
        } catch (e) {
          // DraftEditor was unmounted before this was called
        }
      });
    }
  }

  blockStyleFn = (contentBlock) => {
    const {styles} = this.props;
    const type = contentBlock.getType();
    if (type === 'blockquote') {
      return css(styles.editorBlockquote);
    } else if (type === 'code-block') {
      return css(styles.codeBlock);
    }
    return undefined;
  };

  removeModal = () => {
    const {removeModal, renderModal} = this.props;
    if (renderModal && removeModal) {
      removeModal();
    }
  };

  handleChange = (editorState) => {
    const {setEditorState, handleChange} = this.props;
    if (this.entityPasteStart) {
      const {anchorOffset, anchorKey} = this.entityPasteStart;
      const selectionState = editorState.getSelection().merge({
        anchorOffset,
        anchorKey
      });
      const contentState = entitizeText(editorState.getCurrentContent(), selectionState);
      this.entityPasteStart = undefined;
      if (contentState) {
        setEditorState(EditorState.push(editorState, contentState, 'apply-entity'));
        return;
      }
    }
    if (!editorState.getSelection().getHasFocus()) {
      this.removeModal();
    } else if (handleChange) {
      handleChange(editorState);
    }
    setEditorState(editorState);
  };

  handleUpArrow = (e) => {
    const {handleUpArrow} = this.props;
    if (handleUpArrow) {
      handleUpArrow(e);
    }
  };

  handleDownArrow = (e) => {
    const {handleDownArrow} = this.props;
    if (handleDownArrow) {
      handleDownArrow(e);
    }
  };

  handleTab = (e) => {
    const {handleTab} = this.props;
    if (handleTab) {
      handleTab(e);
    }
  };

  handleReturn = (e) => {
    const {handleReturn} = this.props;
    if (handleReturn) {
      return handleReturn(e);
    }
    return 'not-handled';
  };

  handleEscape = (e) => {
    e.preventDefault();
    this.removeModal();
  };

  handleKeyCommand = (command) => {
    const {handleKeyCommand} = this.props;
    if (handleKeyCommand) {
      return handleKeyCommand(command);
    }
    return undefined;
  };

  keyBindingFn = (e) => {
    const {keyBindingFn} = this.props;
    if (keyBindingFn) {
      return keyBindingFn(e) || getDefaultKeyBinding(e);
    }
    return undefined;
  };

  handleBeforeInput = (char) => {
    const {handleBeforeInput} = this.props;
    if (handleBeforeInput) {
      return handleBeforeInput(char);
    }
    return undefined;
  }

  handlePastedText = (text) => {
    if (text) {
      for (let i = 0; i < textTags.length; i++) {
        const tag = textTags[i];
        if (text.indexOf(tag) !== -1) {
          const selection = this.props.editorState.getSelection();
          this.entityPasteStart = {
            anchorOffset: selection.getAnchorOffset(),
            anchorKey: selection.getAnchorKey()
          };
        }
      }
    }
    return 'not-handled';
  };

  render() {
    const {editorState, readOnly, renderModal, styles, setEditorRef} = this.props;
    // console.log('es', Editor.getClipboard())
    const noText = !editorState.getCurrentContent().hasText();
    const rootStyles = css(
      styles.root,
      noText && styles.rootNoText
    );
    return (
      <div className={rootStyles}>
        <Editor
          blockStyleFn={this.blockStyleFn}
          editorState={editorState}
          handleBeforeInput={this.handleBeforeInput}
          handleKeyCommand={this.handleKeyCommand}
          handlePastedText={this.handlePastedText}
          handleReturn={this.handleReturn}
          keyBindingFn={this.keyBindingFn}
          onChange={this.handleChange}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleTab}
          onUpArrow={this.handleUpArrow}
          placeholder={'Describe what “Done” looks like'}
          readOnly={readOnly}
          ref={setEditorRef}
        />
        {renderModal && renderModal()}
      </div>
    );
  }
}

const styleThunk = () => ({
  root: {
    fontSize: '1rem',
    lineHeight: '1.25rem',
    padding: `0 ${ui.cardPaddingBase}`
  },

  rootNoText: {
    height: '2.5rem'
  },

  editorBlockquote: {
    fontStyle: 'italic',
    borderLeft: `.25rem ${appTheme.palette.mid40a} solid`,
    margin: '1rem 0',
    padding: '0 .5rem'
  },

  codeBlock: {
    backgroundColor: appTheme.palette.mid10a,
    color: appTheme.palette.warm,
    fontFamily: appTheme.typography.monospace,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s6,
    margin: '0',
    padding: '0 .5rem'
  }
});

export default withSuggestions(
  withLinks(
    withMarkdown(
      withKeyboardShortcuts(
        withStyles(styleThunk)(
          ProjectEditor
        )
      )
    )
  )
);
