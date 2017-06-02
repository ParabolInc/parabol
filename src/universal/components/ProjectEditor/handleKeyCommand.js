import {EditorState, Modifier, RichUtils} from 'draft-js';
import maybeLinkify from './maybeLinkify';

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

// "this" is ProjectEditor component instance.
function handleKeyCommand (command, editorState) {
  const {modal, undoLink} = this.state;
  const {onChange} = this.props;
  if (modal) {
    if (command === 'ArrowDown' || command === 'ArrowUp') {
      return 'handled';
    }
  }
  //console.log('command', command)
  if (command === 'strikethrough') {
    onChange(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'));
    return 'handled';
  }

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
  const newState = RichUtils.handleKeyCommand(editorState, command);
  if (newState) {
    onChange(newState);
    return 'handled';
  }
  return 'not-handled';
};

export default handleKeyCommand;