import {Editor, EditorState} from 'draft-js';
import React, {Component} from 'react';
import 'universal/components/TaskEditor/Draft.css';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import truncateCard from 'universal/utils/draftjs/truncateCard';

type Props = {
  content: string
};


class ReflectionEditorWrapperForEmail extends Component<Props> {
  state = {
    editorState: EditorState.createWithContent(truncateCard(this.props.content), editorDecorators(this.getEditorState))
  };

  getEditorState() {
    return this.state.editorState;
  }

  render() {
    const {editorState} = this.state;
    return (
      <Editor
        editorState={editorState}
        readOnly
        style={{padding: '0.8rem', userSelect: 'none', WebkitUserSelect: 'none'}}
      />
    );
  }
}

export default ReflectionEditorWrapperForEmail;
