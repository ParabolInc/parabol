import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from './safeIdentify'
import {handleSuccessfulLogin_UserLogInPayload} from '../__generated__/handleSuccessfulLogin_UserLogInPayload.graphql'
import ReactGA from 'react-ga4'

import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment handleSuccessfulLogin_UserLogInPayload on UserLogInPayload {
    userId
    authToken
    isNewUser
    user {
      tms
      isPatient0
      ...UserAnalyticsFrag @relay(mask: false)
    }
  }
`

type Payload = Omit<handleSuccessfulLogin_UserLogInPayload, ' $refType'>
type GA4SignUpEventEmissionRequiredArgs = {
  isNewUser: boolean
  userId: string
  isPatient0: boolean
}

const emitGA4SignUpEvent = (args: GA4SignUpEventEmissionRequiredArgs) => {
  const {isNewUser, userId, isPatient0} = args
  if (isNewUser) {
    ReactGA.event('sign_up', {
      userId,
      user_properties: {
        is_patient_0: isPatient0
      }
    })
  }
}

const handleSuccessfulLogin = (payload: Payload) => {
  const email = payload?.user?.email
  const userId = payload?.user?.id
  if (!email || !userId) return
  window.localStorage.setItem(LocalStorageKey.EMAIL, email)
  safeIdentify(userId, email)
  emitGA4SignUpEvent({...payload, isPatient0: payload.user.isPatient0})
}

export {GA4SignUpEventEmissionRequiredArgs, emitGA4SignUpEvent, handleSuccessfulLogin}
