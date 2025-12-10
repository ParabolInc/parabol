import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
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
import SearchDatePicker from './components/SearchDatePicker'
import SearchEmptyState from './components/SearchEmptyState'
import SearchInput from './components/SearchInput'
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

interface ViewProps {
  query: string
}

const SearchDataContainer = ({query}: ViewProps) => {
  const atmosphere = useAtmosphere()
  const {location} = useRouter() // Need location for date params
  const {teamIds} = useQueryParameterParser(atmosphere.viewerId)

  const params = new URLSearchParams(location.search)
  const startParam = params.get('start')
  const endParam = params.get('end')

  const LIMIT = 20

  const filter = useMemo(() => {
    return {
      teamIDs: teamIds && teamIds.length > 0 ? teamIds : null,
      startDate: startParam,
      endDate: endParam
    }
  }, [teamIds, startParam, endParam])

  const data = useLazyLoadQuery<any>(
    graphql`
      query SearchViewQuery($query: String!, $filter: SearchFilter, $limit: Int, $offset: Int) {
        search(query: $query, filter: $filter, limit: $limit, offset: $offset) {
          results {
            ...SearchResults_item
          }
          totalCount
        }
        viewer {
           ...TeamFilterMenu_viewer
           teams {
             id
             name
           }
        }
      }
    `,
    {
      query,
      filter,
      limit: LIMIT,
      offset: 0
    },
    {fetchPolicy: 'store-and-network'}
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
      <SearchResults results={data.search?.results || []} query={query} />
    </>
  )
}

const SearchView = () => {
  const {location} = useRouter()
  const params = new URLSearchParams(location.search)
  const query = params.get('q') || ''

  return (
    <Wrapper>
      <Header>
        <SearchInput />
      </Header>

      {!query ? <SearchEmptyState /> : <SearchDataContainer query={query} />}
    </Wrapper>
  )
}

export default SearchView
