import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from './safeIdentify'
import {GA4Frag} from '../__generated__/GA4Frag.graphql'
import ReactGA from 'react-ga4'

type Payload = Omit<GA4Frag, ' $refType'>

const handleSuccessfulLogin = (payload: Payload) => {
  const email = payload?.user?.email
  const userId = payload?.user?.id
  if (!email || !userId) return
  window.localStorage.setItem(LocalStorageKey.EMAIL, email)
  safeIdentify(userId, email)
  if (payload.isNewUser) {
    ReactGA.event('sign_up', {
      userId: userId,
      user_properties: {
        is_patient_0: payload.user.isPatient0
      }
    })
  }
}

export default handleSuccessfulLogin
