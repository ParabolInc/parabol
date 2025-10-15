import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import useRouter from '../../hooks/useRouter'
import SignOutMutation from '../../mutations/SignOutMutation'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError} = useMutationProps()
  useEffect(() => {
    SignOutMutation(atmosphere, {}, {onError, onCompleted, history})
  }, [atmosphere, history, onCompleted, onError])
  return null
}

export default SignoutContainer
