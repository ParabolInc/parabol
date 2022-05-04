import graphql from 'babel-plugin-relay/macro'
import {useEffect, useMemo, useRef, useState} from 'react'
import Atmosphere from '../Atmosphere'
import {
  useAllIntegrationsQuery,
  useAllIntegrationsQueryResponse
} from '../__generated__/useAllIntegrationsQuery.graphql'
import useFilteredItems from './useFilteredItems'

type FetchedItems = NonNullable<
  NonNullable<useAllIntegrationsQueryResponse['viewer']>['teamMember']
>['allAvailableRepoIntegrations']

const gqlQuery = graphql`
  query useAllIntegrationsQuery($teamId: ID!, $userId: ID) {
    viewer {
      teamMember(userId: $userId, teamId: $teamId) {
        allAvailableRepoIntegrations {
          __typename
          id
          ... on JiraServerRemoteProject {
            name
          }
          ... on JiraRemoteProject {
            name
            key
            cloudId
          }
          ... on _xGitHubRepository {
            nameWithOwner
          }
          ... on _xGitLabProject {
            fullPath
          }
          ...TaskFooterIntegrateMenuListItem @relay(mask: false)
        }
      }
    }
  }
`

const getValue = (item: FetchedItems[0]) => {
  if (item.__typename === 'JiraServerRemoteProject') {
    return item.key?.toLowerCase() ?? ''
  } else if (item.__typename === 'JiraRemoteProject') {
    return item.key?.toLowerCase() ?? ''
  } else if (item.__typename === '_xGitHubRepository') {
    return item.nameWithOwner?.toLowerCase() ?? ''
  } else if (item.__typename === '_xGitLabProject') {
    return item.fullPath?.toLowerCase() ?? ''
  }
  return ''
}

const useAllIntegrations = (
  atmosphere: Atmosphere,
  query: string,
  suggestedItems: readonly any[],
  hasMore: boolean,
  teamId: string,
  userId: string | null
) => {
  const [fetchedItems, setFetchedItems] = useState<FetchedItems>([])
  const [status, setStatus] = useState<null | 'loading' | 'loaded' | 'error'>(null)
  // important! isMounted as a plain varaible doesn't work, assumably because isMounted comes from another closure
  // repro: type 2+ characters quickly before the result comes back, isMounted is false after await fetchQuery
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    const fetchIntegrations = async () => {
      const res = await atmosphere.fetchQuery<useAllIntegrationsQuery>(gqlQuery, {
        teamId,
        userId
      })
      if (!res?.viewer.teamMember) {
        if (isMountedRef.current) {
          setStatus('error')
        }
        return
      }
      const {teamMember} = res.viewer
      const {allAvailableRepoIntegrations} = teamMember
      if (isMountedRef.current) {
        setFetchedItems(allAvailableRepoIntegrations)
        setStatus('loaded')
      }
    }
    if (hasMore && query && isMountedRef.current && status !== 'loading' && status !== 'loaded') {
      setStatus('loading')
      fetchIntegrations().catch()
    }
    return () => {
      isMountedRef.current = false
    }
  }, [atmosphere, hasMore, status, teamId, userId, query])

  const dupedItems = useFilteredItems(query, fetchedItems, getValue)
  const allItems = useMemo(() => {
    const idSet = new Set(suggestedItems.map((item) => item.id))
    const uniqueItems = dupedItems.filter((item) => !idSet.has((item as any).id))
    return [...suggestedItems, ...uniqueItems]
  }, [suggestedItems, dupedItems])
  return {allItems, status}
}

export default useAllIntegrations
