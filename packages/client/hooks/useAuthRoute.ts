import {useEffect} from 'react'
import SignUpWithPasswordMutation from '~/mutations/SignUpWithPasswordMutation'
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

function makeid(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
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

      // FIXME we should only create a temporary account and login user if meeting is public
      SignUpWithPasswordMutation(
        atmosphere,
        {
          email: `anonymous.${makeid(10)}@gmail.com`,
          password: makeid(20),
          invitationToken: '',
          isInvitation: false
          //isAnonymous: true
        },
        {
          onError: () => {
            return null
          },
          onCompleted: () => {
            return null
          },
          history
        }
      )

      history.replace({
        pathname: '/',
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}`
      })
    }
  }, [atmosphere, history, options])
}

export default useAuthRoute
