import {ReflectionCard_reflection} from '../../__generated__/ReflectionCard_reflection.graphql'
import {convertFromRaw, convertToRaw, Editor, EditorState} from 'draft-js'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ReflectionEditorWrapper from '../ReflectionEditorWrapper'
import ReflectionFooter from '../ReflectionFooter'
import StyledError from '../StyledError'
import editorDecorators from '../TaskEditor/decorators'
import withAtmosphere, {WithAtmosphereProps} from '../../decorators/withAtmosphere/withAtmosphere'
import EditReflectionMutation from '../../mutations/EditReflectionMutation'
import RemoveReflectionMutation from '../../mutations/RemoveReflectionMutation'
import UpdateReflectionContentMutation from '../../mutations/UpdateReflectionContentMutation'
import {DECELERATE} from '../../styles/animation'
import {Elevation} from '../../styles/elevation'
import isTempId from '../../utils/relay/isTempId'
import withMutationProps, {WithMutationProps} from '../../utils/relay/withMutationProps'
import ReflectionCardDeleteButton from './ReflectionCardDeleteButton'
import {cardBackgroundColor, cardBorderRadius} from '../../styles/cards'
import {ElementWidth} from '../../types/constEnums'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isClipped?: boolean
  className?: string
  handleChange?: () => void
  reflection: ReflectionCard_reflection
  meetingId?: string
  phaseItemId?: string
  readOnly?: boolean
  shadow?: string
  showOriginFooter?: boolean
  userSelect?: 'text' | 'none'
  innerRef?: (c: HTMLDivElement | null) => void
}

interface State {
  content: string
  editorState: EditorState | null
}

interface ReflectionCardRootProps {
  isClosing?: boolean | null
  shadow?: string | null
}

export const ReflectionCardRoot = styled('div')<ReflectionCardRootProps>(
  {
    backgroundColor: cardBackgroundColor,
    borderRadius: cardBorderRadius,
    boxShadow: Elevation.CARD_SHADOW,
    // display was 'inline-block' which causes layout issues (TA)
    display: 'block',
    maxWidth: '100%',
    position: 'relative',
    transition: `box-shadow 2000ms ${DECELERATE}`,
    width: ElementWidth.REFLECTION_CARD
  }
)

class ReflectionCard extends Component<Props, State> {
  static getDerivedStateFromProps (nextProps: Props, prevState: State): Partial<State> | null {
    const {reflection} = nextProps
    const {content} = reflection
    if (!content) {
      // https://sentry.io/organizations/parabol/issues/1143712241/events/a9a26413a96e478180e699294e230f79/?project=107196
      console.error('No content', content, JSON.stringify(reflection))
    }
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

  editorRef = React.createRef<HTMLTextAreaElement | Editor>()

  state = {
    content: '',
    editorState: null
  }

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState})
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
        {onError, onCompleted}
      )
    } else {
      RemoveReflectionMutation(
        atmosphere,
        {reflectionId},
        {meetingId: meetingId!},
        onError,
        onCompleted
      )
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
    this.editorRef.current && this.editorRef.current.blur()
    return 'handled'
  }

  render () {
    const {
      innerRef,
      className,
      isClipped,
      handleChange,
      error,
      meetingId,
      readOnly,
      reflection,
      showOriginFooter,
      userSelect
    } = this.props
    const {editorState} = this.state
    const {
      phaseItem: {question},
      reflectionId
    } = reflection
    return (
      <ReflectionCardRoot className={className} ref={innerRef}>
        <ReflectionEditorWrapper
          isClipped={isClipped}
          ariaLabel='Edit this reflection'
          editorRef={this.editorRef}
          editorState={editorState}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          handleChange={handleChange}
          handleReturn={this.handleReturn}
          placeholder='My reflection… (press enter to add)'
          readOnly={readOnly || isTempId(reflectionId)}
          setEditorState={this.setEditorState}
          userSelect={userSelect}
        />
        {error && <StyledError>{error}</StyledError>}
        {showOriginFooter && <ReflectionFooter>{question}</ReflectionFooter>}
        {!readOnly && meetingId && (
          <ReflectionCardDeleteButton meetingId={meetingId} reflectionId={reflectionId} />
        )}
      </ReflectionCardRoot>
    )
  }
}

// export default withAtmosphere(ReflectionCard)
export default createFragmentContainer(withAtmosphere(withMutationProps(ReflectionCard)), {
  reflection: graphql`
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
})
