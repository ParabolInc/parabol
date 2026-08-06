import {useLocation, useNavigate} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import logo from '../styles/theme/images/graphics/microsoft.svg'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import MicrosoftClientManager from '../utils/MicrosoftClientManager'
import StyledError from './StyledError'
import StyledTip from './StyledTip'

interface Props {
  invitationToken?: string
  isCreate?: boolean
  loginHint?: string
  getOffsetTop?: () => number
}

const MicrosoftOAuthButtonBlock = (props: Props) => {
  const {invitationToken, isCreate, loginHint, getOffsetTop} = props
  const {onError, error, submitting, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const location = useLocation()
  const label = isCreate ? 'Sign up with Microsoft' : 'Sign in with Microsoft'
  const openOAuth = () => {
    const mutationProps = {onError, onCompleted, submitMutation, submitting}
    MicrosoftClientManager.openOAuth(
      atmosphere,
      mutationProps,
      navigate,
      location.search,
      invitationToken,
      loginHint,
      getOffsetTop
    )
  }
  return (
    <>
      <Button
        variant='raised'
        size='sm'
        onClick={openOAuth}
        disabled={submitting}
        className={cn(
          'mt-4 h-10 w-60 justify-start bg-slate-200 px-4 text-slate-700 disabled:opacity-100',
          submitting ? 'bg-slate-300 text-slate-600' : 'bg-white text-slate-700'
        )}
      >
        <img src={logo} className={cn('mx-4 h-[18px] w-[18px]', submitting && 'saturate-0')} />
        <div>{label}</div>
      </Button>
      {error && !submitting && (
        <StyledError className='mt-2 text-[13px]'>{error.message}</StyledError>
      )}
      {submitting && (
        <StyledTip className='mt-2 text-[13px]'>Continue through the login popup</StyledTip>
      )}
    </>
  )
}

export default MicrosoftOAuthButtonBlock
