import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import passwordIcon from '../../../static/images/icons/password_black_24dp.svg'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import EmailPasswordResetMutation from '../mutations/EmailPasswordResetMutation'
import {PALETTE} from '../styles/paletteV3'
import {PasswordResetLink_viewer$key} from '../__generated__/PasswordResetLink_viewer.graphql'
import StyledError from './StyledError'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center'
})

const Link = styled('div')({
  fontWeight: 600,
  color: PALETTE.SKY_500,
  '&:hover': {
    cursor: 'pointer'
  }
})

const StyledIcon = styled('img')({
  paddingRight: 8,
  filter: `invert(56%) sepia(10%) saturate(643%) hue-rotate(205deg) brightness(89%) contrast(92%)` // make svg slate_600
})

const Text = styled('div')({
  fontWeight: 600,
  paddingRight: 8
})

const ErrorMessage = styled(StyledError)({
  fontSize: 12,
  paddingRight: 8
})

type Props = {
  viewerRef: PasswordResetLink_viewer$key
}

const PasswordResetLink = (props: Props) => {
  const {viewerRef} = props
  const [isClicked, setIsClicked] = useState(false)
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted, submitMutation} = useMutationProps()
  const viewer = useFragment(
    graphql`
      fragment PasswordResetLink_viewer on User {
        email
      }
    `,
    viewerRef
  )

  const handleReset = () => {
    setIsClicked(true)
    const {email} = viewer
    submitMutation()
    EmailPasswordResetMutation(atmosphere, {email}, {onError, onCompleted})
  }

  return (
    <Wrapper>
      <StyledIcon crossOrigin='' src={passwordIcon} alt='Password icon' />
      {isClicked ? (
        <>
          {error ? (
            <ErrorMessage>{error.message}</ErrorMessage>
          ) : (
            <Text>Sent! Check your email...</Text>
          )}
          <Link onClick={() => setIsClicked(false)}>Resend a password reset email?</Link>
        </>
      ) : (
        <Link onClick={handleReset}>Send a password reset email</Link>
      )}
    </Wrapper>
  )
}

export default PasswordResetLink
