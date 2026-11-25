import {useEffect} from 'react'
import {setStoredReportsOrgId} from '../../utils/reportsOrgPreference'

const useRememberReportsOrg = (orgId: string, isViewerOnOrg: boolean) => {
  useEffect(() => {
    if (isViewerOnOrg) setStoredReportsOrgId(orgId)
  }, [orgId, isViewerOnOrg])
}

export default useRememberReportsOrg
