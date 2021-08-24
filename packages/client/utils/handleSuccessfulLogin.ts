import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from './safeIdentify'
import safeInitLogRocket from './safeInitLogRocket'

interface Payload {
  user?: {
    id?: string | null
    email?: string | null
  } | null
}

const handleSuccessfulLogin = (payload: Payload) => {
  const email = payload?.user?.email
  const userId = payload?.user?.id
  if (!email || !userId) return
  window.localStorage.setItem(LocalStorageKey.EMAIL, email)
  safeIdentify(userId, email)
  safeInitLogRocket(userId, email)
}

export default handleSuccessfulLogin
