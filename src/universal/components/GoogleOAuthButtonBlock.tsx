import React from 'react'
import styled from 'react-emotion'
import StyledError from './StyledError'
import StyledTip from './StyledTip'
import GoogleOAuthButton from './GoogleOAuthButton'

interface Props {
  label: string
  onClick: () => void
  submitting: boolean
  isError: boolean
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
  const {label, onClick, submitting, isError} = props
  return (
    <React.Fragment>
      <GoogleOAuthButton label={label} onClick={onClick} waiting={submitting} />
      {isError &&
        !submitting && <ErrorMessage>Error logging in! Did you close the popup?</ErrorMessage>}
      {submitting && <HelpMessage>Continue through the login popup</HelpMessage>}
    </React.Fragment>
  )
}

export default GoogleOAuthButtonBlock
