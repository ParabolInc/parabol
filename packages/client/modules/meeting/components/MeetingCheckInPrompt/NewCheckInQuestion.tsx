import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import EditorInputWrapper from '../../../../components/EditorInputWrapper'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import editorDecorators from '../../../../components/TaskEditor/decorators'
import '../../../../components/TaskEditor/Draft.css'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../../../../styles/paletteV2'
import styled from '@emotion/styled'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import {convertFromRaw, convertToRaw, EditorState, SelectionState} from 'draft-js'
import Icon from '../../../../components/Icon'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {NewCheckInQuestion_team} from '../../../../__generated__/NewCheckInQuestion_team.graphql'

const CogIcon = styled(Icon)<{isEditing: boolean}>(({isEditing}) => ({
  color: PALETTE.TEXT_MAIN,
  cursor: 'pointer',
  display: 'block',
  height: 24,
  fontSize: ICON_SIZE.MD18,
  marginLeft: 8,
  paddingTop: 3,
  textAlign: 'center',
  visibility: isEditing ? 'hidden' : 'visible',
  width: 24
}))

const QuestionBlock = styled('div')({
  alignContent: 'center',
  display: 'flex',
  fontSize: 24,
  lineHeight: 1.25,
  padding: '16px 0'
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
  editorRef = React.createRef<any>()
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

  selectAllQuestion = () => {
    this.editorRef.current && this.editorRef.current.focus()
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
          {/* cannot set min width because iPhone 5 has a width of 320*/}
            <EditorInputWrapper
              editorState={editorState}
              setEditorState={this.setEditorState}
              readOnly={!isFacilitating}
              placehodler='e.g. How are you?'
              ref={this.editorRef}
            />
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
