import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'
import signout from './signout'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    signout(atmosphere, history)
  }, [])
  return null
}

export default SignoutContainer
