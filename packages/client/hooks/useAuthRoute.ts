import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import {AuthTokenRole} from '../types/constEnums'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'

interface Options {
  role?: AuthTokenRole
  silent?: boolean
}

const unauthorizedDefault = {
  autoDismiss: 5,
  message: 'Hey! You’re not supposed to be there. Bringing you someplace safe.',
  key: 'unauthorized'
}

const unauthenticatedDefault = {
  autoDismiss: 5,
  message: 'Hey! You haven’t signed in yet. Taking you to the sign in page.',
  key: 'unauthenticated'
}

const useAuthRoute = (inOptions: Options = {}) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const options = useDeepEqual(inOptions)

  const checkAuth = () => {
    const {authObj} = atmosphere
    const {role, silent} = options
    if (authObj) {
      // User is authenticated, check their authorization
      if (role && role !== authObj.rol) {
        atmosphere.eventEmitter.emit('addSnackbar', unauthorizedDefault)
        navigate('/', {replace: true})
      }
    } else {
      // User is not authenticated, redirect them to sign in
      if (!silent) {
        setTimeout(() => {
          atmosphere.eventEmitter.emit('addSnackbar', unauthenticatedDefault)
        })
      }
      navigate(
        {
          pathname: '/',
          search: `?redirectTo=${encodeURIComponent(window.location.pathname)}`
        },
        {replace: true}
      )
    }
  }

  useEffect(checkAuth, [atmosphere.authObj, navigate, options])
}

export default useAuthRoute
