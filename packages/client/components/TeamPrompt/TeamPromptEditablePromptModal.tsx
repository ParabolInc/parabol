import styled from '@emotion/styled'
import React, {useCallback, useState} from 'react'
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

const TextArea = styled(TextAreaAutoSize)({
  backgroundColor: 'transparent',
  border: 0,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: 'none',
  padding: 0,
  resize: 'none',
  width: '100%'
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
  marginLeft: 16
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const SUGGESTED_PROMPTS = [
  'What’s changed with your tasks?',
  'What will you do today?',
  'What did you do since yesterday?',
  'What did you learn today?',
  'What’s got your attention today?'
]

interface Props {
  initialPrompt: string
  onCloseModal: () => void
  onUpdatePrompt: (newPrompt: string) => void
}

const TeamPromptEditablePromptModal = (props: Props) => {
  const {initialPrompt, onCloseModal, onUpdatePrompt} = props
  const [editablePrompt, setEditablePrompt] = useState(initialPrompt)

  const validate = useCallback((rawMeetingPrompt: string) => {
    const res = new Legitity(rawMeetingPrompt)
      .trim()
      .required('Standups need prompts')
      .min(2, 'Standups need good prompts')

    return res
  }, [])

  const handleUpdate = () => {
    onUpdatePrompt(editablePrompt)
    onCloseModal()
  }

  return (
    <DialogContainer>
      <DialogTitle>
        {'Prompt'}
        <StyledCloseButton onClick={onCloseModal}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </DialogTitle>
      <DialogContent>
        <div>
          <TextArea
            autoFocus={true}
            maxLength={200}
            onChange={(e) => {
              const nextValue = e.target.value || ''
              validate(nextValue)
              setEditablePrompt(nextValue)
            }}
            placeholder={'What are you working on today? Stuck on anything?'}
            value={editablePrompt}
          />
        </div>
        <h3>Suggestions</h3>
        <div>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <p key={i} onClick={() => setEditablePrompt(prompt)}>
              {prompt}
            </p>
          ))}
        </div>
        <UpdatePromptFooter>
          <StyledRaisedButton onClick={handleUpdate} size='medium' palette={'blue'}>
            Use prompt
          </StyledRaisedButton>
        </UpdatePromptFooter>
      </DialogContent>
    </DialogContainer>
  )
}

export default TeamPromptEditablePromptModal
