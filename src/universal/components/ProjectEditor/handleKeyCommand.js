import {getDefaultKeyBinding, KeyBindingUtil, RichUtils} from 'draft-js';

const {hasCommandModifier} = KeyBindingUtil;

const customHandleKeyCommand = (editorState, command) => {
  switch (command) {
    case 'strikethrough':
      return RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH');
    default:
      return null;
  }
};

const handleKeyCommand = (onChange, modal) => (command, editorState) => {
  if (modal) {
    if (command === 'ArrowDown' || command === 'ArrowUp') {
      return 'handled';
    }
  }
  console.log('command', command)
  const newState = RichUtils.handleKeyCommand(editorState, command) || customHandleKeyCommand(editorState, command);
  if (newState) {
    onChange(newState);
    return 'handled';
  }
  return 'not-handled';
};

export default handleKeyCommand;