import styled from '@emotion/styled'
import React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import GoogleClientManager from '../utils/GoogleClientManager'
import StyledError from './StyledError'
import StyledTip from './StyledTip'
import logo from '../styles/theme/images/graphics/google.svg'
import RaisedButton from './RaisedButton'
import clsx from 'clsx'

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
  const {onError, error, submitting, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history, location} = useRouter()
  const label = isCreate ? 'Sign up with Google' : 'Sign in with Google'
  const openOAuth = () => {
    const mutationProps = {onError, onCompleted, submitMutation, submitting}
    GoogleClientManager.openOAuth(
      atmosphere,
      mutationProps,
      history,
      location.search,
      invitationToken,
      loginHint
    )
  }
  return (
    <>
      <RaisedButton
        onClick={openOAuth}
        waiting={submitting}
        className={clsx(
          'mt-4 h-10 w-60 justify-start px-4 disabled:opacity-100',
          submitting ? 'bg-[#EBEBEB] text-[#8D8D8D]' : 'text=[#757575] bg-white'
        )}
      >
        <img src={logo} className={clsx('mx-4 h-[18px] w-[18px]', submitting && 'contrast-0')} />
        <div>{label}</div>
      </RaisedButton>
      {error && !submitting && <ErrorMessage>{error.message}</ErrorMessage>}
      {submitting && <HelpMessage>Continue through the login popup</HelpMessage>}
    </>
  )
}

export default GoogleOAuthButtonBlock
