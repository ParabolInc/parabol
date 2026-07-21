import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import passwordIcon from '../../../static/images/icons/password_black_24dp.svg'
import type {PasswordResetLink_viewer$key} from '../__generated__/PasswordResetLink_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import EmailPasswordResetMutation from '../mutations/EmailPasswordResetMutation'
import StyledError from './StyledError'

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

  const link = (onClick: () => void, children: string) => (
    <div className='cursor-pointer font-semibold text-accent' onClick={onClick}>
      {children}
    </div>
  )

  return (
    <div className='flex items-center justify-start'>
      <img
        className='pr-2 [filter:invert(56%)_sepia(10%)_saturate(643%)_hue-rotate(205deg)_brightness(89%)_contrast(92%)] dark:[filter:invert(75%)]'
        crossOrigin=''
        src={passwordIcon}
        alt='Password icon'
      />
      {isClicked ? (
        <>
          {error ? (
            <StyledError className='pr-2 text-xs'>{error.message}</StyledError>
          ) : (
            <div className='pr-2 font-semibold'>Sent! Check your email...</div>
          )}
          {link(() => setIsClicked(false), 'Resend a password reset email?')}
        </>
      ) : (
        link(handleReset, 'Send a password reset email')
      )}
    </div>
  )
}

export default PasswordResetLink
