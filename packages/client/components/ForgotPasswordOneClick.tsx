import styled from '@emotion/styled'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import EmailPasswordResetMutation from '~/mutations/EmailPasswordResetMutation'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  email: string
}

const ForgotButton = styled(PlainButton)({
  color: PALETTE.SKY_500,
  marginTop: '1rem'
})

const MessageSent = styled('div')({
  marginTop: '1rem',
  userSelect: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
})

const ForgotPasswordOneClick = (props: Props) => {
  const {email} = props

  const {t} = useTranslation()

  const [isSent, setIsSent] = useState(false)
  const {submitMutation, submitting, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onClick = async () => {
    if (submitting) return
    submitMutation()
    EmailPasswordResetMutation(atmosphere, {email}, {})
    onCompleted()
    setIsSent(true)
  }

  if (isSent) {
    return (
      <MessageSent>
        <div>
          {t('ForgotPasswordOneClick.MessageSentTo')}
          {email}
        </div>
        <div>{t('ForgotPasswordOneClick.CheckYourInbox')}</div>
      </MessageSent>
    )
  }
  return (
    <ForgotButton onClick={onClick} waiting={submitting}>
      {t('ForgotPasswordOneClick.ForgotYourPassword')}
    </ForgotButton>
  )
}

export default ForgotPasswordOneClick
