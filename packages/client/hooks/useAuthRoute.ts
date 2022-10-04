import {useEffect} from 'react'
import {AuthTokenRole} from '../types/constEnums'
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
  useEffect(() => {
    const {authObj} = atmosphere
    const {role, silent} = options
    if (authObj) {
      if (role && role !== authObj.rol) {
        atmosphere.eventEmitter.emit('addSnackbar', unauthorizedDefault)
        history.replace('/')
      }
    } else {
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
  }, [atmosphere, history, options])
}

export default useAuthRoute
