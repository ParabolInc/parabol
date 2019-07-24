import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import EditorInputWrapper from '../../../../components/EditorInputWrapper'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import editorDecorators from '../../../../components/TaskEditor/decorators'
import '../../../../components/TaskEditor/Draft.css'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ui from '../../../../styles/ui'
import styled from '@emotion/styled'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import {convertFromRaw, convertToRaw, EditorState, SelectionState} from 'draft-js'
import Icon from '../../../../components/Icon'
import {MD_ICONS_SIZE_18} from '../../../../styles/icons'
import {NewCheckInQuestion_team} from '../../../../../__generated__/NewCheckInQuestion_team.graphql'

const CogIcon = styled(Icon)<{isEditing: boolean}>(({isEditing}) => ({
  color: ui.colorText,
  display: 'block',
  height: '1.5rem',
  fontSize: MD_ICONS_SIZE_18,
  verticalAlign: 'middle',
  marginLeft: '0.5rem',
  paddingTop: '.1875rem',
  textAlign: 'center',
  width: '1.25rem',
  visibility: isEditing ? 'hidden' : 'visible',
  cursor: 'pointer'
}))

const QuestionBlock = styled('div')({
  alignContent: 'center',
  display: 'flex',
  fontSize: '1.5rem',
  lineHeight: '1.25',
  padding: `${ui.cardPaddingBase} 0 ${ui.cardPaddingBase} 0`,
  fontWeight: 300
})

const EditorBlock = styled('div')({
  minWidth: '20rem'
})

const getCheckInQuestion = (props) => {
  const {
    team: {newMeeting}
  } = props
  if (!newMeeting) return ''
  return newMeeting.localPhase.checkInQuestion
}

interface Props extends WithAtmosphereProps {
  team: NewCheckInQuestion_team
}

interface State {
  editorState: EditorState
}

class NewCheckInQuestion extends Component<Props, State> {
  constructor (props) {
    super(props)
    const checkInQuestion = getCheckInQuestion(props)
    const contentState = convertFromRaw(JSON.parse(checkInQuestion))
    this.state = {
      editorState: EditorState.createWithContent(
        contentState,
        editorDecorators(this.getEditorState)
      )
    }
  }

  componentWillReceiveProps (nextProps) {
    const checkInQuestion = getCheckInQuestion(nextProps)
    const oldCheckInQuestion = getCheckInQuestion(this.props)
    if (checkInQuestion !== oldCheckInQuestion) {
      const contentState = convertFromRaw(JSON.parse(checkInQuestion))
      this.setState({
        editorState: EditorState.createWithContent(
          contentState,
          editorDecorators(this.getEditorState)
        )
      })
    }
  }

  getEditorState = () => this.state.editorState

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus()
    const isFocused = editorState.getSelection().getHasFocus()
    if (wasFocused && !isFocused) {
      const {atmosphere, team} = this.props
      const {newMeeting} = team
      const {id: meetingId} = newMeeting!
      const checkInQuestion = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      const oldValue = getCheckInQuestion(this.props)
      if (oldValue === checkInQuestion) return
      UpdateNewCheckInQuestionMutation(atmosphere, {
        meetingId,
        checkInQuestion
      })
    }
    this.setState({
      editorState
    })
  }

  editorRef: any

  selectAllQuestion = () => {
    this.editorRef.focus()
    const {editorState} = this.state
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const fullSelection = (selection as any).merge({
      anchorKey: contentState.getFirstBlock().getKey(),
      focusKey: contentState.getLastBlock().getKey(),
      anchorOffset: 0,
      focusOffset: contentState.getLastBlock().getLength()
    }) as SelectionState
    const nextEditorState = EditorState.forceSelection(editorState, fullSelection)
    this.setEditorState(nextEditorState)
  }

  render () {
    const {
      atmosphere,
      team: {newMeeting}
    } = this.props
    if (!newMeeting) return null
    const {facilitatorUserId} = newMeeting
    const {editorState} = this.state
    const isEditing = editorState.getSelection().getHasFocus()
    const {viewerId} = atmosphere
    const isFacilitating = facilitatorUserId === viewerId
    const tip = 'Tap to customize the Social Check-in question.'
    return (
      <Tooltip
        delay={300}
        tip={<div>{tip}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        hideOnFocus
        maxHeight={40}
        isOpen={isEditing || !isFacilitating ? false : undefined}
      >
        <QuestionBlock>
          <EditorBlock>
            <EditorInputWrapper
              editorState={editorState}
              setEditorState={this.setEditorState}
              readOnly={!isFacilitating}
              placehodler='e.g. How are you?'
              innerRef={(c) => {
                this.editorRef = c
              }}
            />
          </EditorBlock>
          {isFacilitating && (
            <PlainButton aria-label={tip} onClick={this.selectAllQuestion}>
              <CogIcon isEditing={isEditing}>settings</CogIcon>
            </PlainButton>
          )}
        </QuestionBlock>
      </Tooltip>
    )
  }
}

export default createFragmentContainer(withAtmosphere(NewCheckInQuestion), {
  team: graphql`
    fragment NewCheckInQuestion_team on Team {
      id
      newMeeting {
        id
        facilitatorUserId
        localPhase {
          ... on CheckInPhase {
            checkInQuestion
          }
        }
        # request question from server to use locally (above)
        phases {
          ... on CheckInPhase {
            checkInQuestion
          }
        }
      }
    }
  `
})
