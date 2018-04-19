import {Editor, EditorState} from 'draft-js';
import React, {Component} from 'react';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import truncateCard from 'universal/utils/draftjs/truncateCard';

type Props = {
  content: string
};


class ReflectionEditorWrapperForEmail extends Component<Props> {
  state = {
    editorState: EditorState.createWithContent(truncateCard(this.props.content, 6, 64), editorDecorators(this.getEditorState))
  };

  getEditorState() {
    return this.state.editorState;
  }

  render() {
    const {editorState} = this.state;
    const userSelect = 'text';
    return (
      <Editor
        editorState={editorState}
        readOnly
        style={{padding: '.5rem', userSelect, WebkitUserSelect: userSelect}}
      />
    );
  }
}

export default ReflectionEditorWrapperForEmail;
