import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import useRouter from '../../hooks/useRouter'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError} = useMutationProps()
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'User Logout')
    atmosphere.invalidateSession('You’ve been logged out successfully.')
  }, [atmosphere, history, onCompleted, onError])
  return null
}

export default SignoutContainer
