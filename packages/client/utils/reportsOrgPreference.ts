import {LocalStorageKey} from '../types/constEnums'

export const getStoredReportsOrgId = () => {
  try {
    return window.localStorage.getItem(LocalStorageKey.REPORTS_ORG_ID)
  } catch {
    return null
  }
}

export const setStoredReportsOrgId = (orgId: string) => {
  try {
    window.localStorage.setItem(LocalStorageKey.REPORTS_ORG_ID, orgId)
  } catch {}
}
