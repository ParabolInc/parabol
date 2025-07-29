import {useEffect} from 'react'
import type {AuthTokenRole} from '../types/constEnums'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'
import useRouter from './useRouter'

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
  const {history} = useRouter()
  const options = useDeepEqual(inOptions)

  const checkAuth = () => {
    const {authObj} = atmosphere
    const {role, silent} = options
    if (authObj) {
      // User is authenticated, check their authorization
      if (role && role !== authObj.rol) {
        atmosphere.eventEmitter.emit('addSnackbar', unauthorizedDefault)
        history.replace('/')
      }
    } else {
      // User is not authenticated, redirect them to sign in
      if (!silent) {
        setTimeout(() => {
          atmosphere.eventEmitter.emit('addSnackbar', unauthenticatedDefault)
        })
      }
      history.replace({
        pathname: '/',
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}`
      })
    }
  }

  useEffect(checkAuth, [atmosphere.authObj, history, options])

  // Detect changes to the auth token in localStorage (e.g., user signs out from another tab)
  const token = window.localStorage.getItem('Action:token')
  useEffect(() => {
    if (!token) {
      atmosphere.setAuthToken(null)
      checkAuth()
    }
  }, [token])
}

export default useAuthRoute
