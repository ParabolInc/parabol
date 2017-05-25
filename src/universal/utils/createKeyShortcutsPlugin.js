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

const createKeyShortcutsPlugin = () => ({
  customStyleMap: {
    STRIKETHROUGH: {
      textDecoration: 'line-through'
    }
  },
  keyBindingFn: (e, b, c) => {
    if (e.key === 'X' && hasCommandModifier(e)) {
      return 'strikethrough';
    }
    return getDefaultKeyBinding(e);
  },
  handleKeyCommand: (command, editorState, pluginFunctions) => {
    const newState = RichUtils.handleKeyCommand(editorState, command) || customHandleKeyCommand(editorState, command);
    if (newState) {
      pluginFunctions.getProps().onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
});

export default createKeyShortcutsPlugin;