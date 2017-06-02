import {EditorState, Modifier, RichUtils} from 'draft-js';
import maybeLinkify from './maybeLinkify';
import maybeDelinkify from 'universal/components/ProjectEditor/maybeDelinkify';

const handleKeyCommand = (onChange, modal) => (command, editorState) => {
  if (modal) {
    if (command === 'ArrowDown' || command === 'ArrowUp') {
      return 'handled';
    }
  }
  console.log('command', command)
  if (command === 'strikethrough') {
    onChange(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'));
    return 'handled';
  }

  if (command === 'space') {
    const maybeLinkifiedEditorState = maybeLinkify(editorState);
    const contentState = Modifier.insertText(
      maybeLinkifiedEditorState.getCurrentContent(),
      maybeLinkifiedEditorState.getSelection(),
      ' '
    );
    const newEditorState = EditorState.push(maybeLinkifiedEditorState, contentState);
    onChange(newEditorState);
    return 'handled';
  }

  if (command === 'split-block') {
    const maybeLinkifiedEditorState = maybeLinkify(editorState);
    const contentState = Modifier.splitBlock(
      maybeLinkifiedEditorState.getCurrentContent(),
      maybeLinkifiedEditorState.getSelection()
    );
    onChange(EditorState.push(maybeLinkifiedEditorState, contentState, 'split-block'));
    return 'handled';
  }

  if (command === 'backspace') {
   return maybeDelinkify(editorState, onChange);
  }
  const newState = RichUtils.handleKeyCommand(editorState, command);
  if (newState) {
    onChange(newState);
    return 'handled';
  }
  return 'not-handled';
};

export default handleKeyCommand;