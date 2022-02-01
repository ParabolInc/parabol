import {LocalStorageKey} from '../types/constEnums'
import ms from 'ms'

export function getIsErrorProne() {
  return window.localStorage.getItem(LocalStorageKey.ERROR_PRONE_AT)
}

export function setIsErrorProne(now = new Date().toJSON()) {
  window.localStorage.setItem(LocalStorageKey.ERROR_PRONE_AT, now)
}

export function maybeRemoveIsErrorProneFlag(errorProneWindow = '14d') {
  const errorProneAtStr = getIsErrorProne()
  const errorProneAtDate = new Date(errorProneAtStr!)
  const isErrorProne =
    errorProneAtDate.toJSON() === errorProneAtStr &&
    errorProneAtDate > new Date(Date.now() - ms(errorProneWindow))

  if (!isErrorProne) {
    window.localStorage.removeItem(LocalStorageKey.ERROR_PRONE_AT)
  }
}
