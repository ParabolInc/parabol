import {convertFromRaw, convertToRaw, EditorState} from 'draft-js'
import React, {Component} from 'react'
import styled from 'react-emotion'
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
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'
import type {ReflectionCard_meeting as Meeting} from './__generated__/ReflectionCard_meeting.graphql'
import type {ReflectionCard_reflection as Reflection} from './__generated__/ReflectionCard_reflection.graphql'
import {DECELERATE} from 'universal/styles/animation'

export type Props = {|
  meeting: Meeting,
  reflection: Reflection,
  shadow?: number,
  ...MutationProps
|}

type State = {|
  content: string,
  editorState: ?Object
|}

export const ReflectionCardRoot = styled('div')(
  {
    backgroundColor: ui.palette.white,
    border: '.0625rem solid transparent',
    borderRadius: ui.cardBorderRadius,
    // useful for drag preview
    display: 'inline-block',
    maxWidth: '100%',
    position: 'relative',
    transition: `box-shadow 2000ms ${DECELERATE}`,
    width: ui.retroCardWidth
  },
  ({isClosing, shadow}) =>
    shadow !== null && {
      boxShadow: isClosing ? ui.shadow[0] : ui.shadow[shadow]
    },
  ({hasDragLock}) =>
    hasDragLock && {
      borderColor: appTheme.palette.warm50a
    }
)

class ReflectionCard extends Component<Props, State> {
  static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
    const {reflection} = nextProps
    const {content} = reflection
    if (content === prevState.content) return null
    const contentState = convertFromRaw(JSON.parse(content))
    // const DEBUG_TEXT = `id: ${reflectionId} | GroupId: ${reflectionGroupId}`
    // const contentState = ContentState.createFromText(DEBUG_TEXT)
    const editorState = EditorState.createWithContent(
      contentState,
      editorDecorators(() => editorState)
    )
    return {
      content,
      editorState
    }
  }

  state = {
    content: '',
    editorState: null
  }

  setEditorState = (editorState: EditorState) => {
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

  handleReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    this.handleEditorBlur()
    return 'handled'
  }

  render () {
    const {
      atmosphere,
      error,
      shadow = 0,
      isDraggable,
      meeting,
      reflection,
      showOriginFooter
    } = this.props
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
    const dragUser = dragContext && dragContext.dragUser
    const hasDragLock = dragUser && dragUser.id !== atmosphere.viewerId
    return (
      <ReflectionCardRoot hasDragLock={hasDragLock} shadow={shadow}>
        {hasDragLock && <UserDraggingHeader user={dragUser} />}
        <ReflectionEditorWrapper
          ariaLabel='Edit this reflection'
          editorRef={this.editorRef}
          editorState={editorState}
          innerRef={this.setEditorRef}
          isDraggable={isDraggable}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          handleReturn={this.handleReturn}
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
        dragUser {
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
