import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ClickUpScopingCurrentFiltersQuery} from '../../__generated__/ClickUpScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../platform/ScopingSearchState'
import {getClickUpLists} from './clickUpLists'

const query = graphql`
  query ClickUpScopingCurrentFiltersQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        services {
          service
          ...clickUpLists_service @relay(mask: false)
        }
      }
    }
  }
`

interface Props {
  state: ScopingSearchState
  queryRef: PreloadedQuery<ClickUpScopingCurrentFiltersQuery>
}

const ClickUpScopingCurrentFilters = (props: Props) => {
  const {state, queryRef} = props
  const data = usePreloadedQuery<ClickUpScopingCurrentFiltersQuery>(query, queryRef)
  const lists = getClickUpLists(data.viewer.teamMember?.services)
  const selectedListNames = searchFiltersByKey(state.filters, 'listIds').flatMap(
    (listId) => lists.find(({integrationRepoId}) => integrationRepoId === listId)?.name ?? []
  )
  return <>{selectedListNames.length ? selectedListNames.join(', ') : 'None'}</>
}

export default ClickUpScopingCurrentFilters
