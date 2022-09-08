import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import GoogleClientManager from '../utils/GoogleClientManager'
import GoogleOAuthButton from './GoogleOAuthButton'
import StyledError from './StyledError'
import StyledTip from './StyledTip'

interface Props {
  invitationToken?: string
  isCreate?: boolean
  loginHint?: string
}

const helpText = {
  fontSize: '.8125rem',
  marginTop: '.5rem'
}

const ErrorMessage = styled(StyledError)({
  ...helpText
})

const HelpMessage = styled(StyledTip)({
  ...helpText
})

const GoogleOAuthButtonBlock = (props: Props) => {
  const {invitationToken, isCreate, loginHint} = props

  const {t} = useTranslation()

  const {onError, error, submitting, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const label = isCreate
    ? t('GoogleOAuthButtonBlock.SignUpWithGoogle')
    : t('GoogleOAuthButtonBlock.SignInWithGoogle')
  const openOAuth = () => {
    const mutationProps = {onError, onCompleted, submitMutation, submitting}
    GoogleClientManager.openOAuth(atmosphere, mutationProps, history, invitationToken, loginHint)
  }
  return (
    <React.Fragment>
      <GoogleOAuthButton label={label} onClick={openOAuth} waiting={submitting} />
      {error && !submitting && <ErrorMessage>{error.message}</ErrorMessage>}
      {submitting && (
        <HelpMessage>{t('GoogleOAuthButtonBlock.ContinueThroughTheLoginPopup')}</HelpMessage>
      )}
    </React.Fragment>
  )
}

export default GoogleOAuthButtonBlock
