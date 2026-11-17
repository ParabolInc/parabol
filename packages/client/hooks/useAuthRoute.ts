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
  const {authObj} = atmosphere
  const isSignedIn = !!authObj && authObj.exp > Date.now() / 1000

  const checkAuth = () => {
    const {role, silent} = options
    if (isSignedIn) {
      // User is authenticated, check their authorization
      if (role && role !== authObj.rol) {
        atmosphere.eventEmitter.emit('addSnackbar', unauthorizedDefault)
        navigate('/', {replace: true})
      }
    } else if (authObj) {
      atmosphere.invalidateSession('Your session has expired. Please log in again.')
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

  useEffect(checkAuth, [authObj, isSignedIn, navigate, options])
  return isSignedIn
}

export default useAuthRoute
