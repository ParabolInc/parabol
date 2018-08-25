import {PhaseItemEditor_meeting} from '__generated__/PhaseItemEditor_meeting.graphql'
import {PhaseItemEditor_retroPhaseItem} from '__generated__/PhaseItemEditor_retroPhaseItem.graphql'
import {ContentState, convertToRaw, EditorState} from 'draft-js'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation'
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import withAtmosphere, {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import CreateReflectionMutation from 'universal/mutations/CreateReflectionMutation'
import getNextSortOrder from 'universal/utils/getNextSortOrder'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps, WithAtmosphereProps {
  meeting: PhaseItemEditor_meeting,
  retroPhaseItem: PhaseItemEditor_retroPhaseItem,
  reflectionStack: Array<any>,
  shadow?: number,
}

interface State {
  editorState?: EditorState
}

class PhaseItemEditor extends Component<Props, State> {
  editTimerId: number | undefined
  state = {
    editorState: EditorState.createWithContent(ContentState.createFromText(''))
  }

  handleSubmit() {
    const {atmosphere, onError, onCompleted, meeting: {meetingId}, submitMutation, reflectionStack, retroPhaseItem: {retroPhaseItemId}} = this.props
    const {editorState} = this.state
    const input = {
      content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      retroPhaseItemId,
      sortOrder: getNextSortOrder(reflectionStack)
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {meetingId}, onError, onCompleted)
  }

  handleEditorBlur() {
    const {
      atmosphere,
      retroPhaseItem: {retroPhaseItemId: phaseItemId}
    } = this.props
    const {editorState} = this.state
    const isDirty = editorState.getCurrentContent().hasText()
    // if they have text there, they'll probably come back to it in 10 seconds
    const delay = isDirty ? 10000 : 0
    this.editTimerId = window.setTimeout(() => {
      this.editTimerId = undefined
      EditReflectionMutation(atmosphere, {isEditing: false, phaseItemId})
    }, delay)
  }

  handleEditorFocus() {
    const {
      atmosphere,
      retroPhaseItem: {retroPhaseItemId: phaseItemId}
    } = this.props
    if (this.editTimerId) {
      this.editTimerId = undefined
      clearTimeout(this.editTimerId)
    }
    EditReflectionMutation(atmosphere, {isEditing: true, phaseItemId})
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
    return (
      <ReflectionCardRoot>
        <ReflectionEditorWrapper
          ariaLabel='Edit this reflection'
          editorState={editorState}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          handleReturn={this.handleReturn}
          placeholder='My reflection thought…'
          setEditorState={this.setEditorState}
        />
      </ReflectionCardRoot>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(PhaseItemEditor)),
  graphql`
    fragment PhaseItemEditor_retroPhaseItem on RetroPhaseItem {
      retroPhaseItemId: id
    }

    fragment PhaseItemEditor_meeting on RetrospectiveMeeting {
      meetingId: id
    }
  `
)
