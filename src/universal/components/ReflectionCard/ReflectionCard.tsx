import {ReflectionCard_reflection} from '__generated__/ReflectionCard_reflection.graphql'
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js'
import React, {Component, ReactElement} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import ReflectionFooter from 'universal/components/ReflectionFooter'
import StyledError from 'universal/components/StyledError'
import editorDecorators from 'universal/components/TaskEditor/decorators'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation'
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from 'universal/mutations/UpdateReflectionContentMutation'
import {DECELERATE} from 'universal/styles/animation'
import {cardShadow} from 'universal/styles/elevation'
import ui from 'universal/styles/ui'
import isTempId from 'universal/utils/relay/isTempId'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'

interface Props extends WithMutationProps, WithAtmosphereProps {
  handleChange?: () => void
  isDraggable?: boolean
  reflection: ReflectionCard_reflection
  meetingId?: string
  phaseItemId?: string
  readOnly?: boolean
  shadow?: number
  showOriginFooter?: boolean
  userSelect?: 'text' | 'none'
  innerRef?: (c: ReactElement<any>) => void
}

interface State {
  content: string
  editorState: EditorState | null
}

interface ReflectionCardRootProps {
  isClosing?: boolean | null
  shadow?: string | null
}

export const ReflectionCardRoot = styled('div')(
  {
    backgroundColor: ui.palette.white,
    borderRadius: ui.cardBorderRadius,
    // useful for drag preview
    display: 'inline-block',
    maxWidth: '100%',
    position: 'relative',
    transition: `box-shadow 2000ms ${DECELERATE}`,
    width: ui.retroCardWidth
  },
  ({isClosing, shadow}: ReflectionCardRootProps) =>
    shadow !== null && {
      boxShadow: isClosing ? cardShadow : shadow
    }
)

class ReflectionCard extends Component<Props, State> {
  static getDerivedStateFromProps (nextProps: Props, prevState: State): Partial<State> | null {
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

  editorRef!: HTMLElement

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

  handleEditorFocus = () => {
    const {
      atmosphere,
      reflection: {reflectionId},
      phaseItemId
    } = this.props
    if (isTempId(reflectionId) || !phaseItemId) return
    EditReflectionMutation(atmosphere, {isEditing: true, phaseItemId})
  }

  handleContentUpdate = () => {
    const {
      atmosphere,
      meetingId,
      reflection: {content, reflectionId},
      submitMutation,
      onError,
      onCompleted
    } = this.props
    const {editorState} = this.state as State
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
      phaseItemId,
      reflection: {reflectionId}
    } = this.props
    if (isTempId(reflectionId) || !phaseItemId) return
    this.handleContentUpdate()
    EditReflectionMutation(atmosphere, {isEditing: false, phaseItemId})
  }

  handleReturn = (e) => {
    if (e.shiftKey) return 'not-handled'
    this.handleEditorBlur()
    return 'handled'
  }

  render () {
    const {
      innerRef,
      atmosphere,
      handleChange,
      error,
      shadow = cardShadow,
      isDraggable,
      meetingId,
      readOnly,
      reflection,
      showOriginFooter,
      userSelect
    } = this.props
    const {editorState} = this.state
    const {
      dragContext,
      phaseItem: {question},
      reflectionId
    } = reflection
    const dragUser = dragContext && dragContext.dragUser
    const hasDragLock = dragUser && dragUser.id !== atmosphere.viewerId
    return (
      <ReflectionCardRoot hasDragLock={hasDragLock} shadow={shadow} innerRef={innerRef}>
        {hasDragLock && <UserDraggingHeader user={dragUser} />}
        <ReflectionEditorWrapper
          ariaLabel='Edit this reflection'
          editorRef={this.editorRef}
          editorState={editorState}
          innerRef={this.setEditorRef}
          isDraggable={isDraggable}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          handleChange={handleChange}
          handleReturn={this.handleReturn}
          placeholder='My reflection thought…'
          readOnly={readOnly || isTempId(reflectionId) || isDraggable}
          setEditorState={this.setEditorState}
          userSelect={userSelect || isDraggable ? 'none' : 'text'}
        />
        {error && <StyledError>{error}</StyledError>}
        {showOriginFooter && <ReflectionFooter>{question}</ReflectionFooter>}
        {!readOnly &&
          meetingId && (
            <ReflectionCardDeleteButton meetingId={meetingId} reflectionId={reflectionId} />
          )}
      </ReflectionCardRoot>
    )
  }
}

// export default withAtmosphere(ReflectionCard)
export default createFragmentContainer(
  withAtmosphere(withMutationProps(ReflectionCard)),
  graphql`
    fragment ReflectionCard_reflection on RetroReflection {
      reflectionId: id
      reflectionGroupId
      content
      phaseItem {
        question
      }
      sortOrder
    }
  `
)
