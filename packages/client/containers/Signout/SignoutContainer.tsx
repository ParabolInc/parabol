import {useEffect} from 'react'
import {useHistory} from 'react-router'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const history = useHistory()
  const {onCompleted, onError} = useMutationProps()
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'User Logout')
    atmosphere.invalidateSession('You’ve been logged out successfully.')
  }, [atmosphere, history, onCompleted, onError])
  return null
}

export default SignoutContainer
