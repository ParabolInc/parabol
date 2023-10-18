import styled from '@emotion/styled'
import React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import MicrosoftClientManager from '../utils/MicrosoftClientManager'
import MicrosoftOAuthButton from './GoogleOAuthButton'
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

const MicrosoftOAuthButtonBlock = (props: Props) => {
  const {invitationToken, isCreate, loginHint} = props
  const {onError, error, submitting, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history, location} = useRouter()
  const label = isCreate ? 'Sign up with Microsoft' : 'Sign in with Microsoft'
  const openOAuth = () => {
    const mutationProps = {onError, onCompleted, submitMutation, submitting}
    MicrosoftClientManager.openOAuth(
      atmosphere,
      mutationProps,
      history,
      location.search,
      invitationToken,
      loginHint
    )
  }
  return (
    <React.Fragment>
      <MicrosoftOAuthButton label={label} onClick={openOAuth} waiting={submitting} />
      {error && !submitting && <ErrorMessage>{error.message}</ErrorMessage>}
      {submitting && <HelpMessage>Continue through the login popup</HelpMessage>}
    </React.Fragment>
  )
}

export default MicrosoftOAuthButtonBlock
