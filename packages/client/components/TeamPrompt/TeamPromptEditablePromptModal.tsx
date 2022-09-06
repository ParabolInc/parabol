import styled from '@emotion/styled'
import {Close, Info} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import TextAreaAutoSize from 'react-textarea-autosize'
import useBreakpoint from '~/hooks/useBreakpoint'
import useForm from '~/hooks/useForm'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import Legitity from '~/validation/Legitity'
import DialogContainer from '../DialogContainer'
import DialogContent from '../DialogContent'
import DialogTitle from '../DialogTitle'
import PlainButton from '../PlainButton/PlainButton'
import RaisedButton from '../RaisedButton'

const StyledDialogContainer = styled(DialogContainer)({
  width: 860,
  overflow: 'auto'
})

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  alignItems: 'center',
  fontSize: 24
})

const LightbulbWrapper = styled('span')({
  marginRight: 12
})

const TextArea = styled(TextAreaAutoSize)<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: 'transparent',
  padding: 24,
  borderColor: PALETTE.SLATE_500,
  borderWidth: 1,
  borderRadius: 8,
  marginB: 24,
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

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
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
  initialPrompt: string
  onCloseModal: () => void
  onSubmitUpdatePrompt: (newPrompt: string) => void
  onCompleted: () => void
  error?: string
}

const TeamPromptEditablePromptModal = (props: Props) => {
  const {initialPrompt, onCloseModal, onSubmitUpdatePrompt, error} = props

  //FIXME i18n: A prompt is required to start the activity
  //FIXME i18n: Prompts should be at least two characters long
  const {t} = useTranslation()

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
    <StyledDialogContainer>
      <StyledDialogTitle>
        {t('TeamPromptEditablePromptModal.Prompt')}
        <StyledCloseButton onClick={onCloseModal}>
          <CloseIcon />
        </StyledCloseButton>
      </StyledDialogTitle>
      <DialogContent>
        <TextArea
          {...fields.meetingPrompt}
          onFocus={(e) => e.target.select()}
          name={t('TeamPromptEditablePromptModal.Meetingprompt')}
          isDesktop={isDesktop}
          autoFocus={true}
          maxLength={500}
          maxRows={3}
          onChange={onChangePrompt}
          placeholder={t('TeamPromptEditablePromptModal.WhatAreYouWorkingOnTodayStuckOnAnything?')}
        />
        {displayError && (
          <ErrorWrapper>
            <InfoIcon />
            {displayError}
          </ErrorWrapper>
        )}
        <SuggestedPromptsHeader>
          {t('TeamPromptEditablePromptModal.Suggestions')}
        </SuggestedPromptsHeader>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <SuggestedPromptWrapper
            isDesktop={isDesktop}
            key={i}
            onClick={() => setValue('meetingPrompt', prompt)}
          >
            <LightbulbWrapper>{t('TeamPromptEditablePromptModal.\udca1')}</LightbulbWrapper>
            {prompt}
          </SuggestedPromptWrapper>
        ))}
        <UpdatePromptFooter>
          <StyledRaisedButton
            disabled={!!fields.meetingPrompt.error}
            onClick={handleSubmitUpdate}
            size='medium'
            palette={t('TeamPromptEditablePromptModal.Blue')}
          >
            {t('TeamPromptEditablePromptModal.UsePrompt')}
          </StyledRaisedButton>
        </UpdatePromptFooter>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default TeamPromptEditablePromptModal
