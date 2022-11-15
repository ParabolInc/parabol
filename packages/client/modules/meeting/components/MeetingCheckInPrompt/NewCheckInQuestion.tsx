import styled from '@emotion/styled'
import {Create as CreateIcon, Refresh as RefreshIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw, EditorState, SelectionState} from 'draft-js'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewCheckInQuestion_meeting} from '~/__generated__/NewCheckInQuestion_meeting.graphql'
import EditorInputWrapper from '../../../../components/EditorInputWrapper'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import '../../../../components/TaskEditor/Draft.css'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useEditorState from '../../../../hooks/useEditorState'
import useTooltip from '../../../../hooks/useTooltip'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import convertToTaskContent from '../../../../utils/draftjs/convertToTaskContent'

const CogIcon = styled('div')({
  color: PALETTE.SLATE_700,
  cursor: 'pointer',
  height: 24,
  svg: {
    fontSize: 18
  },
  margin: '3px 3px 3px 11px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24
})

const QuestionBlock = styled('div')({
  alignContent: 'center',
  display: 'flex',
  fontSize: 24,
  lineHeight: 1.25,
  padding: '16px 0',
  '.DraftEditor-root, textarea': {
    flexGrow: 1,
    padding: '16px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.2)'
    },
    '&:focus-within': {
      backgroundColor: 'rgba(255,255,255,0.6)'
    }
  }
})
interface Props {
  meeting: NewCheckInQuestion_meeting
}

const NewCheckInQuestion = (props: Props) => {
  const editorRef = useRef<HTMLTextAreaElement>()
  const atmosphere = useAtmosphere()
  const {meeting} = props
  const [isEditing, setIsEditing] = useState(false)
  const {id: meetingId, localPhase, facilitatorUserId} = meeting
  const {checkInQuestion} = localPhase
  const [editorState, setEditorState] = useEditorState(checkInQuestion)
  const updateQuestion = (nextEditorState: EditorState) => {
    const wasFocused = editorState.getSelection().getHasFocus()
    const isFocused = nextEditorState.getSelection().getHasFocus()
    setIsEditing(isFocused)
    if (wasFocused && !isFocused) {
      const nextContent = nextEditorState.getCurrentContent()
      const nextCheckInQuestion = nextContent.hasText()
        ? JSON.stringify(convertToRaw(nextContent))
        : ''
      if (nextCheckInQuestion === checkInQuestion) return
      UpdateNewCheckInQuestionMutation(atmosphere, {
        meetingId,
        checkInQuestion: nextCheckInQuestion
      })
    }
    setEditorState(nextEditorState)
  }

  // Handles question update for android devices.
  const updateQuestionAndroidFallback = () => {
    const currentText = editorRef.current?.value
    const nextCheckInQuestion = convertToTaskContent(currentText || '')
    if (nextCheckInQuestion === checkInQuestion) return
    UpdateNewCheckInQuestionMutation(atmosphere, {
      meetingId,
      checkInQuestion: nextCheckInQuestion
    })
  }

  const focusQuestion = () => {
    closeTooltip()
    editorRef.current && editorRef.current.focus()
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const jumpToEnd = (selection as any).merge({
      anchorOffset: contentState.getLastBlock().getLength(),
      focusOffset: contentState.getLastBlock().getLength()
    }) as SelectionState
    const nextEditorState = EditorState.forceSelection(editorState, jumpToEnd)
    setEditorState(nextEditorState)
  }
  const {viewerId} = atmosphere
  const isFacilitating = facilitatorUserId === viewerId
  const tip = 'Tap to customize the Icebreaker'
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: 300,
      disabled: isEditing || !isFacilitating
    }
  )
  const refresh = () => {
    UpdateNewCheckInQuestionMutation(atmosphere, {
      meetingId,
      checkInQuestion: ''
    })
  }
  return (
    <QuestionBlock>
      {/* cannot set min width because iPhone 5 has a width of 320*/}
      <EditorInputWrapper
        ariaLabel={'Edit the icebreaker'}
        editorState={editorState}
        setEditorState={updateQuestion}
        readOnly={!isFacilitating}
        placeholder='e.g. How are you?'
        editorRef={editorRef}
        updateAndroidQuestion={updateQuestionAndroidFallback}
      />
      {isFacilitating && (
        <>
          <PlainButton
            aria-label={tip}
            onClick={focusQuestion}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={originRef}
          >
            <CogIcon>
              <CreateIcon />
            </CogIcon>
          </PlainButton>
          <PlainButton aria-label={'Refresh'} onClick={refresh}>
            <CogIcon>
              <RefreshIcon />
            </CogIcon>
          </PlainButton>
        </>
      )}
      {tooltipPortal(<div>{tip}</div>)}
    </QuestionBlock>
  )
}

export default createFragmentContainer(NewCheckInQuestion, {
  meeting: graphql`
    fragment NewCheckInQuestion_meeting on NewMeeting {
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
  `
})
