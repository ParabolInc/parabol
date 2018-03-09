/**
 * Edits the name of a reflection group.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState} from 'draft-js';
import React from 'react';
import styled from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';

type Props = {
  editorState: EditorState,
  handleSave: (editorState: EditorState) => any,
  setEditorState: (editorState: EditorState) => any
};

const ReflectionGroupNameEditorWrapper = styled('div')({
  height: '1rem',
  marginBottom: 8
});

const ReflectionGroupNameEditor = ({editorState, handleSave, setEditorState}: Props) => (
  <ReflectionGroupNameEditorWrapper>
    <EditorInputWrapper
      ariaLabel="Edit this reflection group title"
      editorState={editorState}
      onBlur={handleSave && (() => handleSave(editorState))}
      placeholder="Theme..."
      setEditorState={setEditorState}
    />
  </ReflectionGroupNameEditorWrapper>
);

export default ReflectionGroupNameEditor;
