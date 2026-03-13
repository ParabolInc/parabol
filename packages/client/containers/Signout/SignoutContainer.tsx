import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {onCompleted, onError} = useMutationProps()
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'User Logout')
    atmosphere.invalidateSession('You’ve been logged out successfully.')
  }, [atmosphere, navigate, onCompleted, onError])
  return null
}

export default SignoutContainer
