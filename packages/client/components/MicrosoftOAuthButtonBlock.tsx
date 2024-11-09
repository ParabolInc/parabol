import styled from '@emotion/styled'
import clsx from 'clsx'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import logo from '../styles/theme/images/graphics/microsoft.svg'
import MicrosoftClientManager from '../utils/MicrosoftClientManager'
import RaisedButton from './RaisedButton'
import StyledError from './StyledError'
import StyledTip from './StyledTip'

interface Props {
  invitationToken?: string
  isCreate?: boolean
  loginHint?: string
  getOffsetTop?: () => number
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
  const {invitationToken, isCreate, loginHint, getOffsetTop} = props
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
      loginHint,
      getOffsetTop
    )
  }
  return (
    <>
      <RaisedButton
        onClick={openOAuth}
        waiting={submitting}
        className={clsx(
          'mt-4 h-10 w-60 justify-start px-4 disabled:opacity-100',
          submitting ? 'bg-slate-300 text-slate-600' : 'bg-white text-slate-700'
        )}
      >
        <img src={logo} className={clsx('mx-4 h-[18px] w-[18px]', submitting && 'saturate-0')} />
        <div>{label}</div>
      </RaisedButton>
      {error && !submitting && <ErrorMessage>{error.message}</ErrorMessage>}
      {submitting && <HelpMessage>Continue through the login popup</HelpMessage>}
    </>
  )
}

export default MicrosoftOAuthButtonBlock
