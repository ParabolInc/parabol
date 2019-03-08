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
  isEditing: boolean
}

class PhaseItemEditor extends Component<Props, State> {
  idleTimerId: number | undefined
  state = {
    editorState: EditorState.createEmpty(),
    isEditing: false
  }

  componentWillUnmount(): void {
    window.clearTimeout(this.idleTimerId)
  }

  handleSubmit() {
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

  ensureNotEditing = () => {
    const {atmosphere, retroPhaseItemId: phaseItemId} = this.props
    const {isEditing} = this.state
    if (!isEditing) return
    window.clearTimeout(this.idleTimerId)
    this.idleTimerId = undefined
    EditReflectionMutation(atmosphere, {isEditing: false, phaseItemId})
    this.setState({
      isEditing: false
    })
  }

  ensureEditing = () => {
    const {atmosphere, retroPhaseItemId: phaseItemId} = this.props
    const {isEditing} = this.state
    if (!isEditing) {
      EditReflectionMutation(atmosphere, {isEditing: true, phaseItemId})
      this.setState({
        isEditing: true
      })
    }
    window.clearTimeout(this.idleTimerId)
    this.idleTimerId = window.setTimeout(() => {
      EditReflectionMutation(atmosphere, {isEditing: false, phaseItemId})
      this.setState({
        isEditing: false
      })
    }, 5000)
  }

  handleEditorBlur = () => {
    this.ensureNotEditing()
  }

  keyBindingFn = () => {
    this.ensureEditing()
  }

  handleEditorFocus = () => {
    this.ensureEditing()
  }

  handleReturn = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return 'not-handled'
    this.handleSubmit()
    return 'handled'
  }

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState})
  }

  render() {
    const {editorState} = this.state
    const {phaseEditorRef} = this.props
    return (
      <ReflectionCardRoot innerRef={phaseEditorRef}>
        <ReflectionEditorWrapper
          ariaLabel="Edit this reflection"
          editorState={editorState}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          handleReturn={this.handleReturn}
          keyBindingFn={this.keyBindingFn}
          placeholder="My reflection… (press enter to add)"
          setEditorState={this.setEditorState}
        />
      </ReflectionCardRoot>
    )
  }
}

export default withAtmosphere(withMutationProps(PhaseItemEditor))
