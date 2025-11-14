import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import useRouter from '../../hooks/useRouter'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError} = useMutationProps()
  useEffect(() => {
    atmosphere.invalidateSession('You’ve been logged out successfully.')
  }, [atmosphere, history, onCompleted, onError])
  return null
}

export default SignoutContainer
