import {ContentState, EditorState} from 'draft-js'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps from '../../utils/relay/withMutationProps'
import {PhaseItemEditor_meeting} from '__generated__/PhaseItemEditor_meeting.graphql'
import {PhaseItemEditor_retroPhaseItem} from '__generated__/PhaseItemEditor_retroPhaseItem.graphql'

interface Props {
  meeting: PhaseItemEditor_meeting,
  retroPhaseItem: PhaseItemEditor_retroPhaseItem,
  shadow?: number,
}

interface State {
  editorState?: EditorState
}

class PhaseItemEditor extends Component<Props, State> {
  state = {
    editorState: EditorState.createWithContent(ContentState.createFromText(''))
  }

  handleSubmit() {
  }

  handleEditorBlur() {
  }

  handleEditorFocus() {
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
      <ReflectionEditorWrapper
        ariaLabel='Edit this reflection'
        editorState={editorState}
        onBlur={this.handleEditorBlur}
        onFocus={this.handleEditorFocus}
        handleReturn={this.handleReturn}
        placeholder='My reflection thought…'
        setEditorState={this.setEditorState}
      />
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
