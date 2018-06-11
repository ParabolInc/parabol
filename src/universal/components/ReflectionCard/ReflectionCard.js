/**
 * The reflection card presentational component.
 *
 * @flow
 */
/* global HTMLElement */
// $FlowFixMe
import {EditorState, ContentState, convertToRaw} from 'draft-js'
import React, {Component} from 'react'
import styled from 'react-emotion'
import reactLifecyclesCompat from 'react-lifecycles-compat'
import {createFragmentContainer} from 'react-relay'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import ReflectionFooter from 'universal/components/ReflectionFooter'
import StyledError from 'universal/components/StyledError'
import editorDecorators from 'universal/components/TaskEditor/decorators'
import UserDraggingHeader from 'universal/components/UserDraggingHeader'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation'
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from 'universal/mutations/UpdateReflectionContentMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {REFLECT} from 'universal/utils/constants'
import isTempId from 'universal/utils/relay/isTempId'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'

import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import type {ReflectionCard_meeting as Meeting} from './__generated__/ReflectionCard_meeting.graphql'
import type {ReflectionCard_reflection as Reflection} from './__generated__/ReflectionCard_reflection.graphql'

export type Props = {|
  // true if the card is in a collapsed group and it is not the top card (default false)
  isCollapsed?: boolean,
  meeting: Meeting,
  reflection: Reflection,
  ...MutationProps
|}

type State = {
  content: string,
  editorState: ?Object,
  getEditorState: () => ?Object
}

export const ReflectionCardRoot = styled('div')(
  {
    backgroundColor: ui.palette.white,
    border: '.0625rem solid transparent',
    borderRadius: ui.cardBorderRadius,
    boxShadow: ui.cardBoxShadow,
    // useful for drag preview
    display: 'inline-block',
    maxWidth: '100%',
    position: 'relative',
    width: ui.retroCardWidth
  },
  ({hasDragLock}) =>
    hasDragLock && {
      borderColor: appTheme.palette.warm50a
    },
  ({isCollapsed}) =>
    isCollapsed && {
      height: `${ui.retroCardCollapsedHeightRem}rem`,
      overflow: 'hidden'
    }
)

class ReflectionCard extends Component<Props, State> {
  static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
    const {reflection, idx, reflectionGroupId} = nextProps
    const {content} = reflection
    if (content === prevState.content) return null
    // const contentState = convertFromRaw(JSON.parse(content))
    const DEBUG_TEXT = `idx: ${idx} | GroupId: ${reflectionGroupId}`
    const contentState = ContentState.createFromText(DEBUG_TEXT)
    return {
      content,
      editorState: EditorState.createWithContent(
        contentState,
        editorDecorators(prevState.getEditorState)
      )
    }
  }

  state = {
    content: '',
    editorState: null,
    getEditorState: () => this.state.editorState
  }

  componentDidMount () {
    this._mounted = true
  }
  componentWillUnmount () {
    this._mounted = false
  }
  setEditorState = (editorState: EditorState) => {
    if (!this._mounted) {
      console.log('FOUND IT! WRAP THIS IN A MOUNT')
    }
    this.setState({editorState})
  }

  setEditorRef = (c) => {
    this.editorRef = c
  }

  editorRef: ?HTMLElement

  handleEditorFocus = () => {
    const {
      atmosphere,
      reflection: {reflectionId}
    } = this.props
    if (isTempId(reflectionId)) return
    EditReflectionMutation(atmosphere, {isEditing: true, reflectionId})
  }

  handleContentUpdate = () => {
    const {
      atmosphere,
      meeting: {meetingId},
      reflection: {content, reflectionId},
      submitMutation,
      onError,
      onCompleted
    } = this.props
    const {editorState} = this.state
    if (!editorState) return
    const contentState = editorState.getCurrentContent()
    if (contentState.hasText()) {
      const nextContent = JSON.stringify(convertToRaw(contentState))
      if (content === nextContent) return
      submitMutation()
      UpdateReflectionContentMutation(
        atmosphere,
        {content: nextContent, reflectionId},
        onError,
        onCompleted
      )
    } else {
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId}, onError, onCompleted)
    }
  }

  handleEditorBlur = () => {
    const {
      atmosphere,
      reflection: {reflectionId}
    } = this.props
    if (isTempId(reflectionId)) return
    this.handleContentUpdate()
    EditReflectionMutation(atmosphere, {isEditing: false, reflectionId})
  }

  render () {
    const {atmosphere, error, isCollapsed, meeting, reflection, showOriginFooter} = this.props
    const {editorState} = this.state
    const {
      localPhase: {phaseType},
      localStage: {isComplete},
      teamId
    } = meeting
    const {
      dragContext,
      isViewerCreator,
      phaseItem: {question},
      reflectionId
    } = reflection
    const canDelete = isViewerCreator && phaseType === REFLECT && !isComplete
    const draggerUser = dragContext && dragContext.draggerUser
    const hasDragLock = draggerUser && draggerUser.id !== atmosphere.viewerId
    return (
      <ReflectionCardRoot hasDragLock={hasDragLock} isCollapsed={isCollapsed}>
        {hasDragLock && <UserDraggingHeader user={draggerUser} />}
        <ReflectionEditorWrapper
          ariaLabel='Edit this reflection'
          editorRef={this.editorRef}
          editorState={editorState}
          innerRef={this.setEditorRef}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          placeholder='My reflection thought…'
          readOnly={phaseType !== REFLECT || isComplete || isTempId(reflectionId)}
          setEditorState={this.setEditorState}
          teamId={teamId}
        />
        {error && <StyledError>{error.message}</StyledError>}
        {showOriginFooter && <ReflectionFooter>{question}</ReflectionFooter>}
        {canDelete && <ReflectionCardDeleteButton meeting={meeting} reflection={reflection} />}
      </ReflectionCardRoot>
    )
  }
}

reactLifecyclesCompat(ReflectionCard)

export default createFragmentContainer(
  withAtmosphere(withMutationProps(ReflectionCard)),
  graphql`
    fragment ReflectionCard_meeting on RetrospectiveMeeting {
      meetingId: id
      teamId
      localPhase {
        phaseType
      }
      localStage {
        isComplete
      }
      phases {
        phaseType
        stages {
          isComplete
        }
      }
      ...ReflectionCardDeleteButton_meeting
    }

    fragment ReflectionCard_reflection on RetroReflection {
      dragContext {
        draggerUser {
          id
          ...UserDraggingHeader_user
        }
      }
      reflectionId: id
      reflectionGroupId
      content
      isViewerCreator
      phaseItem {
        question
      }
      sortOrder
      ...ReflectionCardDeleteButton_reflection
    }
  `
)
