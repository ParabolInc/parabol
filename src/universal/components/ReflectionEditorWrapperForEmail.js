import {convertFromRaw, Editor, EditorState} from 'draft-js'
import React, {Component} from 'react'
import editorDecorators from 'universal/components/TaskEditor/decorators'
import truncateCard from 'universal/utils/draftjs/truncateCard'

type Props = {
  content: string
}

class ReflectionEditorWrapperForEmail extends Component<Props> {
  setEditorState = (content) => {
    const contentState = convertFromRaw(JSON.parse(content))
    this.setState({
      editorState: EditorState.createWithContent(
        contentState,
        editorDecorators(this.getEditorState, this.setEditorState)
      )
    })
  }

  getEditorState = () => {
    return this.state.editorState
  }

  state = {
    editorState: EditorState.createWithContent(
      truncateCard(this.props.content, 6, 64),
      editorDecorators(this.getEditorState, this.setEditorState)
    )
  }

  render() {
    const {editorState} = this.state
    const userSelect = 'text'
    return (
      <Editor
        editorState={editorState}
        readOnly
        style={{padding: '.5rem', userSelect, WebkitUserSelect: userSelect}}
      />
    )
  }
}

export default ReflectionEditorWrapperForEmail
