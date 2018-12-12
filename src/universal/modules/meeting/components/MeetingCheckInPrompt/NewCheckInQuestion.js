import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditorInputWrapper from 'universal/components/EditorInputWrapper'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import editorDecorators from 'universal/components/TaskEditor/decorators'
import 'universal/components/TaskEditor/Draft.css'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'
import UpdateNewCheckInQuestionMutation from 'universal/mutations/UpdateNewCheckInQuestionMutation'
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js'
import type {NewCheckInQuestion_team as Team} from '__generated__/NewCheckInQuestion_team.graphql'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const CogIcon = styled(Icon)(({isEditing}) => ({
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

type Props = {
  atmosphere: Object,
  team: Team
}

type State = {
  editorState: Object
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
      const {
        atmosphere,
        team: {
          newMeeting: {meetingId}
        }
      } = this.props
      const checkInQuestion = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
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
    const fullSelection = selection.merge({
      anchorKey: contentState.getFirstBlock().getKey(),
      focusKey: contentState.getLastBlock().getKey(),
      anchorOffset: 0,
      focusOffset: contentState.getLastBlock().getLength()
    })
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
        tip={<div>{tip}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        hideOnFocus
        maxHeight={40}
      >
        <QuestionBlock>
          <EditorBlock>
            <EditorInputWrapper
              editorState={editorState}
              setEditorState={this.setEditorState}
              placehodler='e.g. How are you?'
              readOnly={!isFacilitating}
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

export default createFragmentContainer(
  withAtmosphere(NewCheckInQuestion),
  graphql`
    fragment NewCheckInQuestion_team on Team {
      id
      newMeeting {
        meetingId: id
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
)
