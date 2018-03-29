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
import withLinks from 'universal/components/TaskEditor/withLinks';
import withSuggestions from 'universal/components/TaskEditor/withSuggestions';

type Props = {
  ariaLabel: string,
  autoFocusOnEmpty: boolean,
  editorState: Object,
  handleBeforeInput: () => void,
  handleChange: () => void,
  handleUpArrow: () => void,
  handleDownArrow: () => void,
  handleKeyCommand: () => void,
  handleTab: () => void,
  handleReturn: () => void,
  isBlurred: boolean,
  isCollapsed: boolean,
  keyBindingFn: () => void,
  placeholder: string,
  onBlur: () => void,
  onFocus: () => void,
  readOnly: boolean,
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

const EditorStyles = styled('div')(
  {
    fontSize: ui.cardContentFontSize,
    lineHeight: ui.cardContentLineHeight,
    padding: `0.8rem`,
    maxHeight: '10rem',
    overflow: 'auto'
  },
  ({isCollapsed}) => isCollapsed && ({
    height: `${ui.retroCardCollapsedHeightRem}rem`,
    overflow: 'hidden'
  }),
  ({isBlurred}) => isBlurred && ({
    filter: 'blur(4px)',
    userSelect: 'none'
  })
)

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

  handleClick = () => {
    this.editorRef.focus();
  };

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
    const {ariaLabel, editorState, isBlurred, isCollapsed, onBlur, placeholder, readOnly} = this.props;
    return (
      <EditorStyles isBlurred={isBlurred} isCollapsed={isCollapsed} onClick={this.handleClick}>
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
          onChange={this.handleChange}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleTab}
          onUpArrow={this.handleUpArrow}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={this.setEditorRef}
        />
      </EditorStyles>
    );
  }
}

export default withSuggestions(
  withLinks(
    withMarkdown(
      withKeyboardShortcuts((ReflectionEditorWrapper)
      )
    )
  )
);

