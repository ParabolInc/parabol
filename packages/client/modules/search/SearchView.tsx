import type {SearchViewQuery} from '.(__generated__)/SearchViewQuery.graphql'
import type {SearchViewViewerQuery} from '.(__generated__)/SearchViewViewerQuery.graphql'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import DashFilterToggle from '~/components/DashFilterToggle/DashFilterToggle'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import {FilterLabels} from '~/types/constEnums'
import lazyPreload from '~/utils/lazyPreload'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import InfiniteScrollSentinel from './components/InfiniteScrollSentinel'
import SearchDatePicker from './components/SearchDatePicker'
import SearchEmptyState from './components/SearchEmptyState'
import SearchInput from './components/SearchInput'
import SearchLoading from './components/SearchLoading'
import SearchResults from './components/SearchResults'

const TeamFilterMenu = lazyPreload(
  () => import(/* webpackChunkName: 'TeamFilterMenu' */ '~/components/TeamFilterMenu')
)

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '64px 32px',
  maxWidth: 900,
  margin: '0 auto',
  width: '100%',
  color: PALETTE.SLATE_200
})

const Header = styled('div')({
  marginBottom: 32
})

const Filters = styled('div')({
  display: 'flex',
  gap: 16,
  marginBottom: 24,
  alignItems: 'center'
})

interface ResultsProps {
  query: string
}

const searchQuery = graphql`
  query SearchViewQuery($query: String!, $filter: SearchFilter, $limit: Int, $offset: Int) {
    search(query: $query, filter: $filter, limit: $limit, offset: $offset) {
      results {
        ...SearchResults_item
      }
      totalCount
    }
  }
`

const SearchResultsContainer = ({query}: ResultsProps) => {
  const atmosphere = useAtmosphere()
  const {location} = useRouter() // Need location for date params
  const {teamIds} = useQueryParameterParser(atmosphere.viewerId)

  const params = new URLSearchParams(location.search)
  const startParam = params.get('start')
  const endParam = params.get('end')
  const dateFieldParam = params.get('dateField')

  const LIMIT = 20

  const filter = useMemo(() => {
    return {
      teamIDs: teamIds && teamIds.length > 0 ? teamIds : null,
      startDate: startParam,
      endDate: endParam,
      dateField: dateFieldParam as any
    }
  }, [teamIds, startParam, endParam, dateFieldParam])

  const initialData = useLazyLoadQuery<SearchViewQuery>(
    searchQuery,
    {
      query,
      filter,
      limit: LIMIT,
      offset: 0
    },
    {fetchPolicy: 'store-and-network'}
  )

  const [additionalResults, setAdditionalResults] = useState<any[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Reset additional results when query filters change
  // Note: initialData will update automatically due to useLazyLoadQuery keying off variables
  useEffect(() => {
    setAdditionalResults([])
    setHasMore(true)
  }, [query, filter])

  const allResults = useMemo(() => {
    return [...(initialData.search?.results || []), ...additionalResults]
  }, [initialData.search?.results, additionalResults])

  const totalCount = initialData.search?.totalCount || 0

  useEffect(() => {
    setHasMore(allResults.length < totalCount)
  }, [allResults.length, totalCount])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const currentCount = allResults.length

    try {
      const data = await atmosphere.fetchQuery<SearchViewQuery>(searchQuery, {
        query,
        filter,
        limit: LIMIT,
        offset: currentCount
      })

      if (data instanceof Error) {
        console.error('Error fetching more results', data)
        return
      }

      const newResults = data.search?.results || []
      if (newResults.length > 0) {
        setAdditionalResults((prev) => [...prev, ...newResults])
      } else {
        setHasMore(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, allResults.length, atmosphere, query, filter, LIMIT])

  return (
    <>
      <SearchResults results={allResults} query={query} />
      <InfiniteScrollSentinel onTrigger={loadMore} hasMore={hasMore} isLoading={isLoadingMore} />
      {isLoadingMore && <SearchLoading />}
    </>
  )
}

const SearchContent = () => {
  const {location} = useRouter() // Get location for search params
  const params = new URLSearchParams(location.search)
  const query = params.get('q') || ''

  const atmosphere = useAtmosphere()
  const {teamIds} = useQueryParameterParser(atmosphere.viewerId)

  const data = useLazyLoadQuery<SearchViewViewerQuery>(
    graphql`
      query SearchViewViewerQuery {
        viewer {
           ...TeamFilterMenu_viewer
           teams {
             id
             name
           }
        }
      }
    `,
    {},
    {fetchPolicy: 'store-or-network'}
  )

  const viewer = data.viewer

  const {
    menuPortal: teamFilterMenuPortal,
    togglePortal: teamFilterTogglePortal,
    originRef: teamFilterOriginRef,
    menuProps: teamFilterMenuProps
  } = useMenu(MenuPosition.LOWER_LEFT, {
    isDropdown: true
  })

  // Safe access to teams
  const teams = viewer?.teams || []
  const teamFilterName =
    teamIds && teamIds.length === 1
      ? teams.find((t: any) => t.id === teamIds[0])?.name || FilterLabels.ALL_TEAMS
      : teamIds?.length
        ? `${teamIds.length} teams`
        : FilterLabels.ALL_TEAMS

  return (
    <>
      <Filters>
        <DashFilterToggle
          label='Collection'
          onClick={teamFilterTogglePortal}
          onMouseEnter={TeamFilterMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
        />
        {teamFilterMenuPortal(<TeamFilterMenu menuProps={teamFilterMenuProps} viewer={viewer} />)}

        <SearchDatePicker />
      </Filters>

      {!query ? (
        <SearchEmptyState />
      ) : (
        <Suspense fallback={<SearchLoading />}>
          <SearchResultsContainer query={query} />
        </Suspense>
      )}
    </>
  )
}

const SearchView = () => {
  return (
    <Wrapper>
      <Header>
        <SearchInput />
      </Header>
      <SearchContent />
    </Wrapper>
  )
}

export default SearchView
