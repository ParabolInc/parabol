import {useNavigate} from '@tanstack/react-router'
import {useEffect} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'

const SignoutContainer = () => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {onCompleted, onError} = useMutationProps()
  useEffect(() => {
    atmosphere.invalidateSession('You’ve been logged out successfully.')
  }, [atmosphere, navigate, onCompleted, onError])
  return null
}

export default SignoutContainer
