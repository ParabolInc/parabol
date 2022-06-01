import styled from '@emotion/styled'
import React, {useCallback, useEffect, useState} from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import Legitity from '~/validation/Legitity'
import DialogContainer from '../DialogContainer'
import DialogContent from '../DialogContent'
import DialogTitle from '../DialogTitle'
import Icon from '../Icon'
import PlainButton from '../PlainButton/PlainButton'
import RaisedButton from '../RaisedButton'

const StyledDialogContainer = styled(DialogContainer)({
  width: 860
})

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  alignItems: 'center',
  fontSize: 24
})

const LightbulbWrapper = styled('span')({
  marginRight: 12
})

const TextArea = styled(TextAreaAutoSize)({
  backgroundColor: 'transparent',
  padding: 24,
  borderColor: PALETTE.SLATE_500,
  borderWidth: 1,
  borderRadius: 8,
  marginB: 24,
  display: 'block',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: '23.4px',
  outline: 'none',
  resize: 'none',
  width: '100%'
})

const SuggestedPromptsHeader = styled('h3')({
  fontSize: 20
})

const SuggestedPromptWrapper = styled('div')({
  padding: '8px 6px',
  fontSize: 18,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: PALETTE.SLATE_200
  }
})

const UpdatePromptFooter = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover': {
    opacity: 0.5
  }
})

const StyledRaisedButton = styled(RaisedButton)({
  marginLeft: 16,
  paddingTop: 12,
  paddingBottom: 12,
  fontSize: 18
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const ErrorWrapper = styled('div')({
  color: PALETTE.ROSE_500,
  display: 'flex',
  alignItems: 'center',
  fontSize: 13,
  marginTop: 16
})

const ErrorIcon = styled(Icon)({
  color: PALETTE.SLATE_500,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8
})

const SUGGESTED_PROMPTS = [
  'What’s changed with your tasks?',
  'What will you do today?',
  'What have you done since yesterday?',
  'What did you learn today?',
  'What’s got your attention today?'
]

interface Props {
  initialPrompt: string
  onCloseModal: () => void
  onSubmitUpdatePrompt: (newPrompt: string) => void
  onCompleted: () => void
  onError: (error: Error) => void
  error?: string
}

const TeamPromptEditablePromptModal = (props: Props) => {
  const {initialPrompt, onCloseModal, onSubmitUpdatePrompt, error, onError, onCompleted} = props
  const [editablePrompt, setEditablePrompt] = useState(initialPrompt)

  const validate = useCallback(
    (rawMeetingPrompt: string) => {
      const res = new Legitity(rawMeetingPrompt)
        .trim()
        .required('A prompt is required to start the activity')
        .min(2, 'Prompts should be at least two characters long')

      if (res.error) {
        onError(new Error(res.error))
      } else if (error) {
        onCompleted()
      }
    },
    [error, onError, onCompleted]
  )

  useEffect(() => validate(editablePrompt), [editablePrompt])

  const handleSubmitUpdate = () => {
    onSubmitUpdatePrompt(editablePrompt)
    onCloseModal()
  }

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>
        {'Prompt'}
        <StyledCloseButton onClick={onCloseModal}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </StyledDialogTitle>
      <DialogContent>
        <TextArea
          autoFocus={true}
          maxLength={500}
          onChange={(e) => {
            const nextValue = e.target.value || ''
            setEditablePrompt(nextValue)
          }}
          placeholder={'What are you working on today? Stuck on anything?'}
          value={editablePrompt}
        />
        {error && (
          <ErrorWrapper>
            <ErrorIcon>info</ErrorIcon>
            {error}
          </ErrorWrapper>
        )}
        <SuggestedPromptsHeader>Suggestions</SuggestedPromptsHeader>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <SuggestedPromptWrapper key={i} onClick={() => setEditablePrompt(prompt)}>
            <LightbulbWrapper>💡</LightbulbWrapper>
            {prompt}
          </SuggestedPromptWrapper>
        ))}
        <UpdatePromptFooter>
          <StyledRaisedButton
            disabled={!!error}
            onClick={handleSubmitUpdate}
            size='medium'
            palette={'blue'}
          >
            Use prompt
          </StyledRaisedButton>
        </UpdatePromptFooter>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default TeamPromptEditablePromptModal
