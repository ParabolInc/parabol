import styled from '@emotion/styled'
import {Create as CreateIcon, Refresh as RefreshIcon} from '@mui/icons-material'
import {EditorContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {NewCheckInQuestion_meeting$key} from '~/__generated__/NewCheckInQuestion_meeting.graphql'
import {
  ModifyType,
  useModifyCheckInQuestionMutation$data as TModifyCheckInQuestion$data
} from '../../../../__generated__/useModifyCheckInQuestionMutation.graphql'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {useTipTapIcebreakerEditor} from '../../../../hooks/useTipTapIcebreakerEditor'
import UpdateNewCheckInQuestionMutation from '../../../../mutations/UpdateNewCheckInQuestionMutation'
import {useModifyCheckInQuestionMutation} from '../../../../mutations/useModifyCheckInQuestionMutation'
import {isEqualWhenSerialized} from '../../../../shared/isEqualWhenSerialized'
import {convertTipTapTaskContent} from '../../../../shared/tiptap/convertTipTapTaskContent'
import {PALETTE} from '../../../../styles/paletteV3'
import {Button} from '../../../../ui/Button/Button'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'

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

interface Props {
  meetingRef: NewCheckInQuestion_meeting$key
}

const NewCheckInQuestion = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meetingRef} = props
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

  const {editor} = useTipTapIcebreakerEditor(checkInQuestion || convertTipTapTaskContent(''), {
    readOnly: !isFacilitating
  })
  const {submitting, submitMutation, onCompleted, onError} = useMutationProps()

  const updateQuestion = () => {
    if (!editor) return
    const {isFocused} = editor
    if (!isFocused) {
      const nextCheckInQuestionJSON = editor.getJSON()
      if (
        checkInQuestion &&
        isEqualWhenSerialized(nextCheckInQuestionJSON, JSON.parse(checkInQuestion))
      )
        return
      UpdateNewCheckInQuestionMutation(
        atmosphere,
        {
          meetingId,
          checkInQuestion: JSON.stringify(nextCheckInQuestionJSON)
        },
        {onCompleted, onError}
      )
    }
  }

  const focusQuestion = () => {
    if (!editor) return
    editor?.commands.focus('all')
    editor?.commands.selectAll()
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
        checkInQuestion: convertTipTapTaskContent(aiUpdatedIcebreaker)
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
      <div className='flex flex-col items-center py-4'>
        <EditorContent
          className='text-2xl [&_.ProseMirror_p]:leading-normal'
          editor={editor}
          onBlur={updateQuestion}
        />
        {isFacilitating && (
          <div className='flex gap-x-2'>
            <Tooltip open={isFacilitating ? undefined : false}>
              <TooltipTrigger asChild>
                <PlainButton aria-label={'Edit icebreaker'} onClick={focusQuestion}>
                  <CogIcon>
                    <CreateIcon />
                  </CogIcon>
                </PlainButton>
              </TooltipTrigger>
              <TooltipContent side={'bottom'}>Edit icebreaker</TooltipContent>
            </Tooltip>
            <Tooltip open={isFacilitating ? undefined : false}>
              <TooltipTrigger asChild>
                <PlainButton aria-label={'Refresh icebreaker'} onClick={refresh}>
                  <CogIcon>
                    <RefreshIcon />
                  </CogIcon>
                </PlainButton>
              </TooltipTrigger>
              <TooltipContent side={'bottom'}>Refresh icebreaker</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
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
    </>
  )
}

export default NewCheckInQuestion
