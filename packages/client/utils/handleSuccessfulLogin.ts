import ReactGA from 'react-ga4'
import {LocalStorageKey} from '~/types/constEnums'
import {handleSuccessfulLogin_UserLogInPayload$data} from '../__generated__/handleSuccessfulLogin_UserLogInPayload.graphql'
import safeIdentify from './safeIdentify'

import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import Atmosphere from '../Atmosphere'

graphql`
  fragment handleSuccessfulLogin_UserLogInPayload on UserLogInPayload {
    userId
    authToken
    isNewUser
    user {
      id
      tms
      isPatient0
      ...UserAnalyticsFrag @relay(mask: false)
    }
  }
`

type Payload = Omit<handleSuccessfulLogin_UserLogInPayload$data, ' $fragmentType'>
export type GA4SignUpEventEmissionRequiredArgs = {
  isNewUser: boolean
  userId: string
  isPatient0: boolean
}

export const emitGA4SignUpEvent = (args: GA4SignUpEventEmissionRequiredArgs) => {
  const {isNewUser, userId, isPatient0} = args
  if (isNewUser) {
    ReactGA.event('sign_up', {
      userId,
      user_properties: {
        is_patient_0: isPatient0
      },
      is_patient_0: isPatient0
    })
  }
}

export const handleSuccessfulLogin = (atmosphere: Atmosphere, payload: Payload) => {
  const email = payload?.user?.email
  const userId = payload?.user?.id
  if (!email || !userId) return
  window.localStorage.setItem(LocalStorageKey.EMAIL, email)
  safeIdentify(userId, email)
  const isNewUser = payload?.isNewUser ?? false
  commitLocalUpdate(atmosphere, (store) => {
    const root = store.getRoot()
    root.setValue(isNewUser, 'isNewUser')
  })
  emitGA4SignUpEvent({isNewUser, userId, isPatient0: payload.user.isPatient0})
}
