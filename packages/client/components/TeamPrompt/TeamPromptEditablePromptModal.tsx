import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import type * as React from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import useBreakpoint from '~/hooks/useBreakpoint'
import useForm from '~/hooks/useForm'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import Legitity from '~/validation/Legitity'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import RaisedButton from '../RaisedButton'

const LightbulbWrapper = styled('span')({
  marginRight: 12
})

const TextArea = styled(TextAreaAutoSize)<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: 'transparent',
  padding: 24,
  borderColor: PALETTE.SLATE_500,
  borderWidth: 1,
  borderRadius: 8,
  display: 'block',
  fontSize: isDesktop ? 18 : 16,
  fontWeight: 400,
  lineHeight: '23.4px',
  outline: 'none',
  resize: 'none',
  width: '100%'
}))

const SuggestedPromptsHeader = styled('h3')({
  fontSize: 20
})

const SuggestedPromptWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  padding: '8px 6px',
  fontSize: isDesktop ? 18 : 16,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: PALETTE.SLATE_200
  }
}))

const UpdatePromptFooter = styled('div')({
  paddingTop: 24,
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledRaisedButton = styled(RaisedButton)({
  marginLeft: 16,
  paddingTop: 12,
  paddingBottom: 12,
  fontSize: 18
})

const ErrorWrapper = styled('div')({
  color: PALETTE.ROSE_500,
  display: 'flex',
  alignItems: 'center',
  fontSize: 13,
  marginTop: 16
})

const InfoIcon = styled(Info)({
  color: PALETTE.SLATE_500,
  height: 18,
  width: 18,
  marginRight: 8
})

const SUGGESTED_PROMPTS = [
  'What’s changed with your tasks?',
  'What will you do today?',
  'What have you done since yesterday?',
  'What did you learn today?',
  'What’s got your attention today?',
  'What are you working on today? Stuck on anything?'
]

interface Props {
  isOpen: boolean
  initialPrompt: string
  onCloseModal: () => void
  onSubmitUpdatePrompt: (newPrompt: string) => void
  onCompleted: () => void
  error?: string
}

const TeamPromptEditablePromptModal = (props: Props) => {
  const {isOpen, initialPrompt, onCloseModal, onSubmitUpdatePrompt, error} = props
  const {
    validateField,
    setDirtyField,
    setValue,
    onChange: onChangePrompt,
    fields
  } = useForm({
    meetingPrompt: {
      getDefault: () => initialPrompt,
      validate: (rawMeetingPrompt) => {
        return new Legitity(rawMeetingPrompt)
          .trim()
          .required('A prompt is required to start the activity')
          .min(2, 'Prompts should be at least two characters long')
      }
    }
  })

  const displayError = fields.meetingPrompt.error ?? error
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const handleSubmitUpdate = () => {
    setDirtyField()
    const {meetingPrompt: meetingPromptRes} = validateField()
    if (meetingPromptRes.error) return
    const {value: meetingPrompt} = meetingPromptRes
    onSubmitUpdatePrompt(meetingPrompt)
    onCloseModal()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onCloseModal}>
      <DialogContent className='w-[860px] max-w-[95vw] overflow-auto'>
        <DialogTitle>Prompt</DialogTitle>
        <TextArea
          {...fields.meetingPrompt}
          onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => e.target.select()}
          name='meetingPrompt'
          isDesktop={isDesktop}
          autoFocus={true}
          maxLength={500}
          maxRows={3}
          onChange={onChangePrompt}
          placeholder='What are you working on today? Stuck on anything?'
        />
        {displayError && (
          <ErrorWrapper>
            <InfoIcon />
            {displayError}
          </ErrorWrapper>
        )}
        <SuggestedPromptsHeader>Suggestions</SuggestedPromptsHeader>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <SuggestedPromptWrapper
            isDesktop={isDesktop}
            key={i}
            onClick={() => setValue('meetingPrompt', prompt)}
          >
            <LightbulbWrapper>💡</LightbulbWrapper>
            {prompt}
          </SuggestedPromptWrapper>
        ))}
        <UpdatePromptFooter>
          <StyledRaisedButton
            disabled={!!fields.meetingPrompt.error}
            onClick={handleSubmitUpdate}
            size='medium'
            palette='blue'
          >
            Use prompt
          </StyledRaisedButton>
        </UpdatePromptFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TeamPromptEditablePromptModal
