import styled from '@emotion/styled'
import type * as React from 'react'
import {useEffect, useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {LocalStorageKey} from '../types/constEnums'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'
import PrimaryButton from './PrimaryButton'

interface Props {
  closePortal: () => void
  error: Error
  eventId: string
}

export const ERROR_FEEDBACK_ENABLED = !!window.__ACTION__.HUBSPOT_ERROR_FORM_URL

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 480
})

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  [INVITE_DIALOG_MEDIA_QUERY]: {
    padding: '16px 32px 32px'
  }
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const Description = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: 1.5,
  paddingLeft: 24,
  [INVITE_DIALOG_MEDIA_QUERY]: {
    paddingLeft: 32
  }
})

const ReportErrorFeedback = (props: Props) => {
  const {closePortal, error, eventId} = props
  const [text, setText] = useState('')
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value
    setText(nextValue)
  }
  const url = window.__ACTION__.HUBSPOT_ERROR_FORM_URL
  useEffect(() => {
    if (!url) {
      closePortal()
    }
  }, [url, closePortal])
  if (!url) {
    return null
  }
  const email = window.localStorage.getItem(LocalStorageKey.EMAIL)

  const onSubmit = () => {
    if (!text) return
    const body = JSON.stringify({
      fields: [
        {
          name: 'email',
          value: email || 'errors@parabol.co'
        },
        {
          name: 'TICKET.subject',
          value: error.message
        },
        {
          name: 'TICKET.content',
          value: text
        },
        {
          name: 'TICKET.eventid',
          value: eventId
        }
      ]
    })
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
    closePortal()
  }

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>Report Error</StyledDialogTitle>
      <Description>What were you doing when the error happened?</Description>
      <StyledDialogContent>
        <BasicTextArea autoFocus name='errorReport' onChange={onChange} value={text} />
        <ButtonGroup>
          <PrimaryButton onClick={onSubmit} disabled={text.length === 0} size='medium'>
            {'Submit Report'}
          </PrimaryButton>
        </ButtonGroup>
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default ReportErrorFeedback
