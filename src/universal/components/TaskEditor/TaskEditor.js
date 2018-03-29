import {css} from 'aphrodite-local-styles/no-important';
import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withMarkdown from 'universal/components/TaskEditor/withMarkdown';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {textTags} from 'universal/utils/constants';
import entitizeText from 'universal/utils/draftjs/entitizeText';
import './Draft.css';
import withKeyboardShortcuts from './withKeyboardShortcuts';
import withLinks from './withLinks';
import withSuggestions from './withSuggestions';

class TaskEditor extends Component {
  static propTypes = {
    editorRef: PropTypes.any,
    editorState: PropTypes.object,
    setEditorState: PropTypes.func,
    trackEditingComponent: PropTypes.func,
    handleBeforeInput: PropTypes.func,
    handleChange: PropTypes.func,
    handleKeyCommand: PropTypes.func,
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

  handleReturn = (e) => {
    const {handleReturn} = this.props;
    if (handleReturn) {
      return handleReturn(e);
    }
    return 'not-handled';
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
      keyBindingFn(e);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.removeModal();
    } else {
      getDefaultKeyBinding(e);
    }
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
    const placeholder = 'Describe what “Done” looks like';
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
          placeholder={placeholder}
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
    fontSize: ui.cardContentFontSize,
    lineHeight: ui.cardContentLineHeight,
    padding: `0 ${ui.cardPaddingBase}`
  },

  rootNoText: {
    height: '2.75rem' // Use this if the placeholder wraps
  },

  editorBlockquote: {
    fontStyle: 'italic',
    borderLeft: `.125rem ${appTheme.palette.mid40a} solid`,
    margin: '.5rem 0',
    padding: '0 .5rem'
  },

  codeBlock: {
    backgroundColor: appTheme.palette.mid10a,
    borderLeft: `.125rem ${appTheme.palette.mid40a} solid`,
    borderRadius: '.0625rem',
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
          TaskEditor
        )
      )
    )
  )
);
