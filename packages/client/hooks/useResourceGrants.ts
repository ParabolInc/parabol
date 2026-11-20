import {useState} from 'react'
import type {PageResult} from '../modules/userDashboard/components/PageGrant'

export type GrantModeOption = 'all' | 'custom'

interface Grants {
  grantedOrgIds: readonly string[] | null
  grantedTeamIds: readonly string[] | null
  grantedPageIds: readonly string[] | null
}

type Organizations = ReadonlyArray<{id: string; teams: ReadonlyArray<{id: string}>}>

const useResourceGrants = (initialGrants?: Grants) => {
  const [orgGrantMode, setOrgGrantMode] = useState<GrantModeOption>(
    initialGrants?.grantedOrgIds ? 'custom' : 'all'
  )
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(
    new Set(initialGrants?.grantedOrgIds ?? [])
  )
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    new Set(initialGrants?.grantedTeamIds ?? [])
  )
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set())
  const [pageGrantMode, setPageGrantMode] = useState<GrantModeOption>(
    initialGrants?.grantedPageIds ? 'custom' : 'all'
  )
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(
    new Set(initialGrants?.grantedPageIds ?? [])
  )
  const [selectedPagesMap, setSelectedPagesMap] = useState<Map<string, PageResult>>(new Map())

  const toggleExpandOrg = (orgId: string) => {
    setExpandedOrgIds((prev) => {
      const next = new Set(prev)
      if (next.has(orgId)) next.delete(orgId)
      else next.add(orgId)
      return next
    })
  }

  const togglePage = (page: PageResult) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev)
      if (next.has(page.id)) {
        next.delete(page.id)
        setSelectedPagesMap((pages) => {
          const nextPages = new Map(pages)
          nextPages.delete(page.id)
          return nextPages
        })
      } else {
        next.add(page.id)
        setSelectedPagesMap((pages) => new Map(pages).set(page.id, page))
      }
      return next
    })
  }

  const getGrants = (organizations: Organizations) => {
    const grantedPageIds = pageGrantMode === 'custom' ? [...selectedPageIds] : null
    if (orgGrantMode !== 'custom')
      return {grantedOrgIds: null, grantedTeamIds: null, grantedPageIds}
    // a fully selected org already covers its teams
    const coveredTeamIds = new Set(
      organizations
        .filter((org) => selectedOrgIds.has(org.id))
        .flatMap((org) => org.teams.map((team) => team.id))
    )
    return {
      grantedOrgIds: [...selectedOrgIds],
      grantedTeamIds: [...selectedTeamIds].filter((teamId) => !coveredTeamIds.has(teamId)),
      grantedPageIds
    }
  }

  return {
    orgGrantMode,
    setOrgGrantMode,
    selectedOrgIds,
    setSelectedOrgIds,
    selectedTeamIds,
    setSelectedTeamIds,
    expandedOrgIds,
    toggleExpandOrg,
    pageGrantMode,
    setPageGrantMode,
    selectedPageIds,
    selectedPagesMap,
    togglePage,
    getGrants
  }
}

export default useResourceGrants
