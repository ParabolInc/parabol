import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import EditorInputWrapper from '../../../../components/EditorInputWrapper'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import '../../../../components/TaskEditor/Draft.css'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import {PALETTE} from '../../../../styles/paletteV2'
import styled from '@emotion/styled'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import {convertToRaw, EditorState, SelectionState} from 'draft-js'
import Icon from '../../../../components/Icon'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {NewCheckInQuestion_team} from '../../../../__generated__/NewCheckInQuestion_team.graphql'
import useEditorState from '../../../../hooks/useEditorState'
import {ICheckInPhase} from '../../../../types/graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'

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

interface Props{
  team: NewCheckInQuestion_team
}

const NewCheckInQuestion = (props: Props) => {
  const editorRef = useRef<HTMLTextAreaElement>()
  const atmosphere = useAtmosphere()
  const {team} = props
  const {newMeeting} = team
  if (!newMeeting) return null
  const {id: meetingId, localPhase, facilitatorUserId} = newMeeting
  const {checkInQuestion} = localPhase as ICheckInPhase
  const [editorState, setEditorState] = useEditorState(checkInQuestion)

  const updateQuestion = (nextEditorState: EditorState) => {
    const wasFocused = editorState.getSelection().getHasFocus()
    const isFocused = nextEditorState.getSelection().getHasFocus()
    console.log('isWas', isFocused, wasFocused)
    if (wasFocused && !isFocused) {
      const nextCheckInQuestion = JSON.stringify(convertToRaw(nextEditorState.getCurrentContent()))
      if (nextCheckInQuestion === checkInQuestion) return
      UpdateNewCheckInQuestionMutation(atmosphere, {
        meetingId,
        checkInQuestion: nextCheckInQuestion
      })
    }
    setEditorState(nextEditorState)
  }

  const selectAllQuestion = () => {
    editorRef.current && editorRef.current.focus()
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const fullSelection = (selection as any).merge({
      anchorKey: contentState.getFirstBlock().getKey(),
      focusKey: contentState.getLastBlock().getKey(),
      anchorOffset: 0,
      focusOffset: contentState.getLastBlock().getLength()
    }) as SelectionState
    const nextEditorState = EditorState.forceSelection(editorState, fullSelection)
    setEditorState(nextEditorState)
  }

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
          ariaLabel={'Edit the check in question'}
          editorState={editorState}
          setEditorState={updateQuestion}
          readOnly={!isFacilitating}
          placeholder='e.g. How are you?'
          editorRef={editorRef}
        />
        {isFacilitating && (
          <PlainButton aria-label={tip} onClick={selectAllQuestion}>
            <CogIcon isEditing={isEditing}>settings</CogIcon>
          </PlainButton>
        )}
      </QuestionBlock>
    </Tooltip>
  )
}

export default createFragmentContainer(NewCheckInQuestion, {
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
