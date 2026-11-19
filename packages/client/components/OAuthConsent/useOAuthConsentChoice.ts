import {useState} from 'react'

export type OAuthConsentOrgMode = 'all' | 'pick'

const useOAuthConsentChoice = (allowedOrgIds: string[]) => {
  const [orgMode, setOrgMode] = useState<OAuthConsentOrgMode>('all')
  const [pickedOrgIds, setPickedOrgIds] = useState(allowedOrgIds)
  const [includePrivate, setIncludePrivate] = useState(true)
  const togglePickedOrg = (orgId: string) =>
    setPickedOrgIds((orgIds) =>
      orgIds.includes(orgId) ? orgIds.filter((id) => id !== orgId) : [...orgIds, orgId]
    )
  const grantedOrgIds = allowedOrgIds.length === 0 ? [] : orgMode === 'all' ? null : pickedOrgIds
  return {
    orgMode,
    setOrgMode,
    pickedOrgIds,
    togglePickedOrg,
    includePrivate,
    setIncludePrivate,
    grantedOrgIds
  }
}

export type OAuthConsentChoice = ReturnType<typeof useOAuthConsentChoice>

export default useOAuthConsentChoice
