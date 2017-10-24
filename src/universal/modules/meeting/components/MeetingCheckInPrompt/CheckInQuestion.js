import {css} from 'aphrodite-local-styles/no-important';
import './CheckInQuestion.css';
import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import 'universal/components/ProjectEditor/Draft.css';
import withKeyboardShortcuts from 'universal/components/ProjectEditor/withKeyboardShortcuts';
import withMarkdown from 'universal/components/ProjectEditor/withMarkdown';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {textTags} from 'universal/utils/constants';
import entitizeText from 'universal/utils/draftjs/entitizeText';

const iconStyle = {
  fontSize: '1rem',
  verticalAlign: 'middle',
  marginLeft: '0.5rem'
};

const buttonStyle = {
  cursor: 'pointer'
};

const withKey = (key, fn) => (event) => {
  if (event && event.key && event.key === key) {
    fn(event);
  }
};

class CheckInQuestion extends Component {
  static propTypes = {
    canEdit: PropTypes.bool,
    editorState: PropTypes.object,
    setEditorState: PropTypes.func,
    handleBeforeInput: PropTypes.func,
    handleChange: PropTypes.func,
    handleUpArrow: PropTypes.func,
    handleDownArrow: PropTypes.func,
    handleKeyCommand: PropTypes.func,
    handleTab: PropTypes.func,
    handleReturn: PropTypes.func,
    keyBindingFn: PropTypes.func,
    styles: PropTypes.object
  };

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
    if (editorState.getSelection().getHasFocus() && handleChange) {
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
    if (e.shiftKey || !this.editorRef) {
      return 'not-handled';
    }
    this.editorRef.blur();
    return 'handled';
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

  selectAllQuestion = () => {
    this.editorRef.focus();
    const {editorState, setEditorState} = this.props;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const fullSelection = selection.merge({
      anchorKey: contentState.getFirstBlock().getKey(),
      focusKey: contentState.getLastBlock().getKey(),
      anchorOffset: 0,
      focusOffset: contentState.getLastBlock().getLength()
    });
    const nextEditorState = EditorState.forceSelection(editorState, fullSelection);
    setEditorState(nextEditorState);
  };

  render() {
    const {editorState, canEdit, styles} = this.props;
    const isEditing = editorState.getSelection().getHasFocus();
    const tip = canEdit
      ? 'Tap to customize'
      : 'Upgrade to a Pro Account to customize the Social Check-in question.';
    return (
      <Tooltip
        tip={<div>{tip}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        hideOnFocus
      >
        <div className={css(styles.root)}>
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
            placeholder="e.g. How are you?"
            readOnly={!canEdit}
            ref={(c) => {
              this.editorRef = c;
            }}
          />
          {canEdit && !isEditing &&
            <FontAwesome
              role="button"
              aria-label={tip}
              tabIndex="0"
              name="pencil"
              style={{...iconStyle, ...buttonStyle}}
              onClick={this.selectAllQuestion}
              onKeyDown={withKey(' ', (event) => { event.preventDefault(); })}
              onKeyUp={withKey(' ', this.selectAllQuestion)}
            />
          }
          {!canEdit && <FontAwesome name="pencil" style={iconStyle} />}
        </div>
      </Tooltip>
    );
  }
}

const styleThunk = () => ({
  root: {
    display: 'flex',
    fontSize: '1.5rem',
    lineHeight: '1.25rem',
    padding: `${ui.cardPaddingBase} 0 ${ui.cardPaddingBase} 0`,
    fontWeight: 300
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

export default withMarkdown(
  withKeyboardShortcuts(
    withStyles(styleThunk)(
      CheckInQuestion
    )
  )
);
