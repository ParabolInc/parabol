import styled from '@emotion/styled'
import {Create as CreateIcon, Refresh as RefreshIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {ContentState, EditorState, SelectionState, convertToRaw} from 'draft-js'
import React, {useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {NewCheckInQuestion_meeting$key} from '~/__generated__/NewCheckInQuestion_meeting.graphql'
import {
  ModifyType,
  useModifyCheckInQuestionMutation$data as TModifyCheckInQuestion$data
} from '../../../../__generated__/useModifyCheckInQuestionMutation.graphql'
import EditorInputWrapper from '../../../../components/EditorInputWrapper'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import '../../../../components/TaskEditor/Draft.css'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useEditorState from '../../../../hooks/useEditorState'
import useMutationProps from '../../../../hooks/useMutationProps'
import useTooltip from '../../../../hooks/useTooltip'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import {useModifyCheckInQuestionMutation} from '../../../../mutations/useModifyCheckInQuestionMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Button} from '../../../../ui/Button/Button'
import convertToTaskContent from '../../../../utils/draftjs/convertToTaskContent'

const CogIcon = styled('div')({
  color: PALETTE.SLATE_700,
  cursor: 'pointer',
  height: 24,
  svg: {
    fontSize: 18
  },
  margin: 3,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24
})

const QuestionBlock = styled('div')({
  alignContent: 'center',
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
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
    },
    '.public-DraftStyleDefault-block': {
      textAlign: 'center'
    }
  }
})

interface Props {
  meeting: NewCheckInQuestion_meeting$key
}

const NewCheckInQuestion = (props: Props) => {
  const editorRef = useRef<HTMLTextAreaElement>()
  const atmosphere = useAtmosphere()
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
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
        team {
          organization {
            useAI
          }
        }
      }
    `,
    meetingRef
  )
  const [isEditing, setIsEditing] = useState(false)
  const [aiUpdatedIcebreaker, setAiUpdatedIcebreaker] = useState('')
  const {
    id: meetingId,
    localPhase,
    facilitatorUserId,
    team: {
      organization: {useAI}
    }
  } = meeting
  const {checkInQuestion} = localPhase
  const {viewerId} = atmosphere
  const isFacilitating = facilitatorUserId === viewerId

  const [editorState, setEditorState] = useEditorState(checkInQuestion)
  const {submitting, submitMutation, onCompleted, onError} = useMutationProps()

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
      UpdateNewCheckInQuestionMutation(
        atmosphere,
        {
          meetingId,
          checkInQuestion: nextCheckInQuestion
        },
        {onCompleted, onError}
      )
    }
    setEditorState(nextEditorState)
  }

  // Handles question update for android devices.
  const updateQuestionAndroidFallback = () => {
    const currentText = editorRef.current?.value
    const nextCheckInQuestion = convertToTaskContent(currentText || '')
    if (nextCheckInQuestion === checkInQuestion) return
    UpdateNewCheckInQuestionMutation(
      atmosphere,
      {
        meetingId,
        checkInQuestion: nextCheckInQuestion
      },
      {onCompleted, onError}
    )
  }

  const {
    tooltipPortal: editIcebreakerTooltipPortal,
    openTooltip: openEditIcebreakerTooltip,
    closeTooltip: closeEditIcebreakerTooltip,
    originRef: editIcebreakerOriginRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER, {
    disabled: isEditing || !isFacilitating
  })
  const {
    tooltipPortal: refreshIcebreakerTooltipPortal,
    openTooltip: openRefreshIcebreakerTooltip,
    closeTooltip: closeRefreshIcebreakerTooltip,
    originRef: refreshIcebreakerOriginRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER, {
    disabled: !isFacilitating
  })

  const focusQuestion = () => {
    closeEditIcebreakerTooltip()
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

  const refresh = () => {
    UpdateNewCheckInQuestionMutation(
      atmosphere,
      {
        meetingId,
        checkInQuestion: ''
      },
      {onCompleted, onError}
    )
    setAiUpdatedIcebreaker('')
  }

  const updateCheckInQuestionWithGeneratedContent = () => {
    submitMutation()
    UpdateNewCheckInQuestionMutation(
      atmosphere,
      {
        meetingId,
        checkInQuestion: JSON.stringify(
          convertToRaw(ContentState.createFromText(aiUpdatedIcebreaker))
        )
      },
      {onCompleted, onError}
    )
    setAiUpdatedIcebreaker('')
  }

  const [executeModifyCheckInQuestionMutation, isModifyingCheckInQuestion] =
    useModifyCheckInQuestionMutation()
  const modifyCheckInQuestion = (modifyType: ModifyType) => {
    const icebreakerToModify = aiUpdatedIcebreaker || checkInQuestion!
    executeModifyCheckInQuestionMutation({
      variables: {
        meetingId,
        checkInQuestion: icebreakerToModify,
        modifyType
      },
      onCompleted: (res: TModifyCheckInQuestion$data) => {
        const {modifyCheckInQuestion} = res
        if (!modifyCheckInQuestion.modifiedCheckInQuestion) {
          return
        }

        setAiUpdatedIcebreaker(modifyCheckInQuestion.modifiedCheckInQuestion)
      }
    })
  }
  const showAiIcebreaker = useAI && isFacilitating && window.__ACTION__.hasOpenAI

  return (
    <>
      <QuestionBlock id='test'>
        {/* cannot set min width because iPhone 5 has a width of 320*/}
        <EditorInputWrapper
          ariaLabel={'Edit the icebreaker'}
          editorState={editorState}
          setEditorState={updateQuestion}
          readOnly={!isFacilitating}
          placeholder='e.g. How are you?'
          editorRef={editorRef}
          setEditorStateFallback={updateQuestionAndroidFallback}
        />
        {isFacilitating && (
          <div className='flex gap-x-2'>
            <PlainButton
              aria-label={'Edit icebreaker'}
              onClick={focusQuestion}
              onMouseEnter={openEditIcebreakerTooltip}
              onMouseLeave={closeEditIcebreakerTooltip}
              ref={editIcebreakerOriginRef}
            >
              <CogIcon>
                <CreateIcon />
              </CogIcon>
            </PlainButton>
            <PlainButton
              aria-label={'Refresh icebreaker'}
              onClick={refresh}
              onMouseEnter={openRefreshIcebreakerTooltip}
              onMouseLeave={closeRefreshIcebreakerTooltip}
              ref={refreshIcebreakerOriginRef}
            >
              <CogIcon>
                <RefreshIcon />
              </CogIcon>
            </PlainButton>
          </div>
        )}
      </QuestionBlock>
      {showAiIcebreaker && (
        <div className='flex flex-col gap-4 rounded-lg bg-slate-100 p-6'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='inline-flex gap-2'>
              <div className='font-semibold'>Modify current icebreaker with AI</div>
            </div>
            <div className='text-center text-sm italic'>
              <div>As a facilitator, you can spice up the current icebreaker with AI.</div>
              <div>Others will see the result only if you approve it.</div>
            </div>
          </div>
          {aiUpdatedIcebreaker && <div className='p-2 text-center'>{aiUpdatedIcebreaker}</div>}
          <div className='flex items-center justify-center gap-x-3'>
            <Button
              variant='outline'
              shape='pill'
              size='sm'
              disabled={isModifyingCheckInQuestion}
              onClick={() => modifyCheckInQuestion('SERIOUS')}
            >
              More serious
            </Button>
            <Button
              variant='outline'
              shape='pill'
              size='sm'
              disabled={isModifyingCheckInQuestion}
              onClick={() => modifyCheckInQuestion('FUNNY')}
            >
              Funnier
            </Button>
            <Button
              variant='outline'
              shape='pill'
              size='sm'
              disabled={isModifyingCheckInQuestion}
              onClick={() => modifyCheckInQuestion('EXCITING')}
            >
              More exciting
            </Button>
          </div>
          <div className='flex items-center justify-center gap-x-3'>
            <Button
              variant='secondary'
              shape='pill'
              size='md'
              disabled={aiUpdatedIcebreaker === '' || isModifyingCheckInQuestion || submitting}
              onClick={updateCheckInQuestionWithGeneratedContent}
            >
              {isModifyingCheckInQuestion ? 'Modifying...' : 'Approve'}
            </Button>
          </div>
        </div>
      )}
      {editIcebreakerTooltipPortal(<>Edit icebreaker</>)}
      {refreshIcebreakerTooltipPortal(<>Refresh icebreaker</>)}
    </>
  )
}

export default NewCheckInQuestion
