/**
 * The reflection card presentational component.
 *
 * @flow
 */
/* global HTMLElement */
// $FlowFixMe
import {ContentState, EditorState} from 'draft-js'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {PhaseItemEditor_meeting as Meeting} from './__generated__/PhaseItemEditor_meeting.graphql'

export type Props = {|
  meeting: Meeting,
  shadow?: number,
  ...MutationProps
|}

type State = {|
  content: string,
  editorState: ?Object
|}

class PhaseItemEditor extends Component<Props, State> {
  state = {
    editorState: EditorState.createWithContent(ContentState.createFromText(''))
  }

  handleSubmit () {}

  handleEditorBlur () {}

  handleEditorFocus () {}

  handleReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    this.handleSubmit()
    return 'handled'
  }

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState})
  }

  render () {
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
