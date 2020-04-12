import {useEffect} from 'react'
import signout from './signout'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    signout(atmosphere, history)
  }, [])
  return null
}

export default SignoutContainer
