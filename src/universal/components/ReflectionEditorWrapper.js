import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import React, {Component} from 'react';
import 'universal/components/TaskEditor/Draft.css';
import withKeyboardShortcuts from 'universal/components/TaskEditor/withKeyboardShortcuts';
import withMarkdown from 'universal/components/TaskEditor/withMarkdown';
import appTheme from 'universal/styles/theme/appTheme';
import {textTags} from 'universal/utils/constants';
import entitizeText from 'universal/utils/draftjs/entitizeText';
import styled, {css} from 'react-emotion';
import ui from 'universal/styles/ui';
import withEmojis from 'universal/components/TaskEditor/withEmojis';

type Props = {
  ariaLabel: string,
  autoFocusOnEmpty: boolean,
  editorState: Object,
  handleBeforeInput: () => void,
  handleChange: () => void,
  handleKeyCommand: () => void,
  handleReturn: () => void,
  isBlurred: boolean,
  keyBindingFn: () => void,
  placeholder: string,
  onBlur: () => void,
  onFocus: () => void,
  readOnly: boolean,
  removeModal?: () => void,
  renderModal?: () => void,
  setEditorState: () => void,
  innerRef: () => void,
};

const editorBlockquote = css({
  fontStyle: 'italic',
  borderLeft: `.25rem ${appTheme.palette.mid40a} solid`,
  margin: '1rem 0',
  padding: '0 .5rem'
});

const codeBlock = css({
  backgroundColor: appTheme.palette.mid10a,
  color: appTheme.palette.warm,
  fontFamily: appTheme.typography.monospace,
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s6,
  margin: '0',
  padding: '0 .5rem'
});

const EditorStyles = styled('div')(({isBlurred}) => ({
  color: isBlurred === false ? ui.hintFontColor : appTheme.palette.dark,
  filter: isBlurred && 'blur(.25rem)',
  fontSize: ui.cardContentFontSize,
  lineHeight: ui.cardContentLineHeight,
  maxHeight: '10rem',
  minHeight: '1rem',
  overflow: 'auto',
  position: 'relative',
  userSelect: isBlurred && 'none',
  width: '100%'
}));

class ReflectionEditorWrapper extends Component<Props> {
  componentDidMount() {
    const {editorState} = this.props;
    if (!editorState.getCurrentContent().hasText()) {
      setTimeout(() => {
        try {
          this.editorRef.focus();
        } catch (e) {
          // DraftEditor was unmounted before this was called
        }
      });
    }
  }

  setEditorRef = (c) => {
    const {innerRef} = this.props;
    if (innerRef) {
      innerRef(c);
    }
    this.editorRef = c;
  };

  blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === 'blockquote') {
      return editorBlockquote;
    } else if (type === 'code-block') {
      return codeBlock;
    }
    return undefined;
  };

  handleChange = (editorState) => {
    const {handleChange, setEditorState} = this.props;
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
      const result = keyBindingFn(e);
      if (result) {
        return result;
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.removeModal();
      return undefined;
    }
    return getDefaultKeyBinding(e);
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

  removeModal = () => {
    const {removeModal, renderModal} = this.props;
    if (renderModal && removeModal) {
      removeModal();
    }
  };

  render() {
    const {ariaLabel, editorState, isBlurred, onBlur, onFocus, placeholder, renderModal, readOnly} = this.props;
    // Folks may want to copy text from reflection cards to quote in task cards,
    // so going to allow unless AnonymousReflectionCard.
    // If isBlurred is true or false it’s probably from the AnonymousReflectionCard.
    const userSelect = isBlurred === undefined ? 'text' : 'none';

    return (
      <EditorStyles isBlurred={isBlurred}>
        <Editor
          ariaLabel={ariaLabel}
          blockStyleFn={this.blockStyleFn}
          editorState={editorState}
          handleBeforeInput={this.handleBeforeInput}
          handleKeyCommand={this.handleKeyCommand}
          handlePastedText={this.handlePastedText}
          handleReturn={this.handleReturn}
          keyBindingFn={this.keyBindingFn}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={this.handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={this.setEditorRef}
          style={{padding: '.75rem', userSelect, WebkitUserSelect: userSelect}}
        />
        {renderModal && renderModal()}
      </EditorStyles>
    );
  }
}

export default withEmojis(withMarkdown(
  withKeyboardShortcuts((ReflectionEditorWrapper)
  ))
);
