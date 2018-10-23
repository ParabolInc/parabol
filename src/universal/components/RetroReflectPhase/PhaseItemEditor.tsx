import {convertToRaw, EditorState} from 'draft-js'
import React, {Component} from 'react'
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import CreateReflectionMutation from 'universal/mutations/CreateReflectionMutation'
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps, WithAtmosphereProps {
  meetingId: string
  nextSortOrder: () => number
  phaseEditorRef: React.RefObject<HTMLDivElement>
  retroPhaseItemId: string
  shadow?: number
}

interface State {
  editorState?: EditorState
}

class PhaseItemEditor extends Component<Props, State> {
  editTimerId: number | undefined
  state = {
    editorState: EditorState.createEmpty()
  }

  handleSubmit () {
    const {
      atmosphere,
      onError,
      onCompleted,
      meetingId,
      nextSortOrder,
      submitMutation,
      retroPhaseItemId
    } = this.props
    const content = this.state.editorState.getCurrentContent()
    if (!content.hasText()) return
    const input = {
      content: JSON.stringify(convertToRaw(content)),
      retroPhaseItemId,
      sortOrder: nextSortOrder()
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {meetingId}, onError, onCompleted)
    const empty = EditorState.createEmpty()
    const editorState = EditorState.moveFocusToEnd(empty)
    this.setState({
      editorState
    })
  }

  handleEditorBlur = () => {
    const {atmosphere, retroPhaseItemId: phaseItemId} = this.props
    const {editorState} = this.state
    const isDirty = editorState.getCurrentContent().hasText()
    // if they have text there, they'll probably come back to it in 10 seconds
    const delay = isDirty ? 5000 : 0
    clearTimeout(this.editTimerId)
    this.editTimerId = window.setTimeout(() => {
      this.editTimerId = undefined
      EditReflectionMutation(atmosphere, {isEditing: false, phaseItemId})
    }, delay)
  }

  handleEditorFocus = () => {
    const {atmosphere, retroPhaseItemId: phaseItemId} = this.props
    if (this.editTimerId) {
      clearTimeout(this.editTimerId)
      this.editTimerId = undefined
    } else {
      EditReflectionMutation(atmosphere, {isEditing: true, phaseItemId})
    }
  }

  handleReturn = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return 'not-handled'
    this.handleSubmit()
    return 'handled'
  }

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState})
  }

  render () {
    const {editorState} = this.state
    const {phaseEditorRef} = this.props
    return (
      <ReflectionCardRoot innerRef={phaseEditorRef}>
        <ReflectionEditorWrapper
          ariaLabel='Edit this reflection'
          editorState={editorState}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          handleReturn={this.handleReturn}
          placeholder='My reflection… (press enter to add)'
          setEditorState={this.setEditorState}
        />
      </ReflectionCardRoot>
    )
  }
}

export default withAtmosphere(withMutationProps(PhaseItemEditor))
