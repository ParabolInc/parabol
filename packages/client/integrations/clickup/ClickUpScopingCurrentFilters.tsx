import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ClickUpScopingCurrentFiltersQuery} from '../../__generated__/ClickUpScopingCurrentFiltersQuery.graphql'
import plural from '../../utils/plural'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../platform/ScopingSearchState'
import {getClickUpLists, getUnavailableClickUpListIds} from './clickUpLists'

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
  const selectedListIds = searchFiltersByKey(state.filters, 'listIds')
  const selectedListNames = selectedListIds.flatMap(
    (listId) => lists.find(({integrationRepoId}) => integrationRepoId === listId)?.name ?? []
  )
  const unavailableCount = getUnavailableClickUpListIds(lists, selectedListIds).length
  const labels = unavailableCount
    ? [...selectedListNames, `${unavailableCount} unavailable ${plural(unavailableCount, 'list')}`]
    : selectedListNames
  return <>{labels.length ? labels.join(', ') : 'None'}</>
}

export default ClickUpScopingCurrentFilters
