import {Editor, getDefaultKeyBinding} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withMarkdown from 'universal/components/ProjectEditor/withMarkdown';
import withKeyboardShortcuts from './withKeyboardShortcuts';
import withLinks from './withLinks';
import withSuggestions from './withSuggestions';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

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

  componentDidMount() {
    const {editorState} = this.props;
    const text = editorState.getCurrentContent().getPlainText();
    if (text === '') {
      this.editorRef.focus();
    }
  }

  state = {};

  blockStyleFn = (contentBlock) => {
    const {styles} = this.props;
    const type = contentBlock.getType();
    if (type === 'blockquote') {
      return css(styles.editorBlockquote);
    }
  };

  removeModal = () => {
    const {removeModal, renderModal} = this.props;
    if (renderModal && removeModal) {
      removeModal();
    }
  };

  handleChange = (editorState) => {
    const {setEditorState, handleChange} = this.props;
    if (!editorState.getSelection().getHasFocus()) {
      this.removeModal();
      setEditorState(editorState)
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

  handleBeforeInput = (char) => {
    const {handleBeforeInput, editorState, setEditorState} = this.props;
    if (handleBeforeInput) {
      return handleBeforeInput(char, editorState, setEditorState);
    }
  }

  render() {
    const {editorState, setEditorState, renderModal, isDragging, styles} = this.props;
    //console.log('es', editorState)
    return (
      <div className={css(styles.root)}>
        <Editor
          blockStyleFn={this.blockStyleFn}
          editorState={editorState}
          handleBeforeInput={this.handleBeforeInput}
          handleKeyCommand={this.handleKeyCommand}
          handleReturn={this.handleReturn}
          keyBindingFn={this.keyBindingFn}
          onChange={this.handleChange}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleTab}
          onUpArrow={this.handleUpArrow}
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

const styleThunk = () => ({
  root: {
    padding: `0 ${ui.cardPaddingBase}`
  },

  editorBlockquote: {
    fontStyle: 'italic',
    borderLeft: `.25rem ${appTheme.palette.mid40l} solid`,
    paddingLeft: '.5rem'
  }
});

export default
withSuggestions(
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
