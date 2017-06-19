import {EditorState, Modifier} from 'draft-js';

const addSpace = (editorState) => {
  const contentState = Modifier.insertText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    ' '
  );
  return EditorState.push(editorState, contentState, 'insert-characters');
};

export default addSpace;
