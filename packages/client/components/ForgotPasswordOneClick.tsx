import {useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import EmailPasswordResetMutation from '~/mutations/EmailPasswordResetMutation'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  email: string
}

const ForgotPasswordOneClick = (props: Props) => {
  const {email} = props
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
      <div className='mt-4 flex select-none flex-col items-center justify-center'>
        <div>Message sent to {email}</div>
        <div>Check your inbox!</div>
      </div>
    )
  }
  return (
    <PlainButton className='mt-4 text-accent' onClick={onClick} waiting={submitting}>
      Forgot your password?
    </PlainButton>
  )
}

export default ForgotPasswordOneClick
