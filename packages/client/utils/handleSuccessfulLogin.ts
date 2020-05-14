import {LocalStorageKey} from '~/types/constEnums'

interface Payload {
  user?: {
    email?: string | null
  } | null
}

const handleSuccessfulLogin = (payload: Payload) => {
  const email = payload?.user?.email
  if (!email) return
  window.localStorage.setItem(LocalStorageKey.EMAIL, email)
}

export default handleSuccessfulLogin
