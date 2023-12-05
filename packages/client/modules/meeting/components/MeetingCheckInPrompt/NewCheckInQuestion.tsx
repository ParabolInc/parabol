import styled from '@emotion/styled'
import {Create as CreateIcon, Refresh as RefreshIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {ContentState, convertToRaw, EditorState, SelectionState} from 'draft-js'
import React, {useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {NewCheckInQuestion_meeting$key} from '~/__generated__/NewCheckInQuestion_meeting.graphql'
import EditorInputWrapper from '../../../../components/EditorInputWrapper'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import '../../../../components/TaskEditor/Draft.css'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useEditorState from '../../../../hooks/useEditorState'
import useTooltip from '../../../../hooks/useTooltip'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import ModifyCheckInQuestionMutation from '../../../../mutations/ModifyCheckInQuestionMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import convertToTaskContent from '../../../../utils/draftjs/convertToTaskContent'
import useMutationProps from '../../../../hooks/useMutationProps'
import clsx from 'clsx'
import {
  ModifyCheckInQuestionMutation$data,
  ModifyType
} from '../../../../__generated__/ModifyCheckInQuestionMutation.graphql'

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
            featureFlags {
              aiIcebreakers
            }
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
      organization: {featureFlags}
    }
  } = meeting
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
  const {submitting, submitMutation} = useMutationProps()
  const {
    submitting: isModifyingCheckInQuestion,
    submitMutation: submitModifyCheckInQuestion,
    onError: onModifyCheckInQuestionError,
    onCompleted: onModifyCheckInQuestionCompleted
  } = useMutationProps()
  const refresh = () => {
    UpdateNewCheckInQuestionMutation(atmosphere, {
      meetingId,
      checkInQuestion: ''
    })
    setAiUpdatedIcebreaker('')
  }

  const updateCheckInQuestionWithGeneratedContent = () => {
    submitMutation()
    UpdateNewCheckInQuestionMutation(atmosphere, {
      meetingId,
      checkInQuestion: JSON.stringify(
        convertToRaw(ContentState.createFromText(aiUpdatedIcebreaker))
      )
    })
    setAiUpdatedIcebreaker('')
  }

  const modify = (modifyType: ModifyType) => {
    submitModifyCheckInQuestion()

    const icebreakerToModify = aiUpdatedIcebreaker || checkInQuestion!
    ModifyCheckInQuestionMutation(
      atmosphere,
      {
        meetingId,
        checkInQuestion: icebreakerToModify,
        modifyType
      },
      {
        onCompleted: (res: ModifyCheckInQuestionMutation$data) => {
          onModifyCheckInQuestionCompleted()
          const {modifyCheckInQuestion} = res
          if (!modifyCheckInQuestion.modifiedCheckInQuestion) {
            return
          }

          setAiUpdatedIcebreaker(modifyCheckInQuestion.modifiedCheckInQuestion)
        },
        onError: onModifyCheckInQuestionError
      }
    )
  }

  const shouldShowAiIcebreakers = featureFlags?.aiIcebreakers && isFacilitating

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
          </div>
        )}
        {tooltipPortal(<div>{tip}</div>)}
      </QuestionBlock>
      {shouldShowAiIcebreakers && (
        <div className='flex flex-col gap-6 rounded-lg bg-slate-100 p-4'>
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
            <button
              className={clsx(
                'text-gray-900 hover:bg-gray-200 cursor-pointer rounded-full bg-white px-2.5 py-1 text-xs font-semibold'
              )}
              disabled={submitting}
              onClick={() => modify('SERIOUS')}
            >
              More serious
            </button>
            <button
              className={clsx(
                'text-gray-900 hover:bg-gray-50 cursor-pointer rounded-full bg-white px-2.5 py-1 text-xs font-semibold'
              )}
              disabled={submitting}
              onClick={() => modify('FUNNY')}
            >
              More funny
            </button>
            <button
              className={clsx(
                'text-gray-900 hover:bg-gray-50 cursor-pointer rounded-full bg-white px-2.5 py-1 text-xs font-semibold'
              )}
              disabled={submitting}
              onClick={() => modify('EXCITING')}
            >
              More exciting
            </button>
          </div>
          <div className='flex items-center justify-center gap-x-3'>
            <button
              className={clsx(
                'cursor-pointer rounded-full bg-sky-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:pointer-events-none disabled:opacity-50'
              )}
              disabled={aiUpdatedIcebreaker === '' || isModifyingCheckInQuestion}
              onClick={updateCheckInQuestionWithGeneratedContent}
            >
              {isModifyingCheckInQuestion ? 'Modifying...' : 'Approve'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default NewCheckInQuestion
