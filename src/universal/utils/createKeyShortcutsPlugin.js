// import {getDefaultKeyBinding, KeyBindingUtil, RichUtils} from 'draft-js';
//
// const {hasCommandModifier} = KeyBindingUtil;
//
// const customHandleKeyCommand = (editorState, command) => {
//  switch (command) {
//    case 'strikethrough':
//      return RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH');
//    default:
//      return null;
//  }
// };
//
// const customStyleMap = {
//  STRIKETHROUGH: {
//    textDecoration: 'line-through'
//  }
// };
//
// const keyBindingFn = (e) => {
//  if (e.key === 'X' && hasCommandModifier(e)) {
//    return 'strikethrough';
//  }
//  return getDefaultKeyBinding(e);
// };
//
// const handleKeyCommand = (command, editorState, pluginFunctions) => {
//  const newState = RichUtils.handleKeyCommand(editorState, command) || customHandleKeyCommand(editorState, command);
//  if (newState) {
//    pluginFunctions.getProps().onChange(newState);
//    return 'handled';
//  }
//  return 'not-handled';
// };
//
// const withKeyboardShorts = (Editor) => (props) => {
//  return (
//    <Editor
//      {...props}
//      customStyleMap
//    />
// }
