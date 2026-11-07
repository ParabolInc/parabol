import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ClickUpScopingCurrentFiltersQuery} from '../../__generated__/ClickUpScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../platform/ScopingSearchState'

const query = graphql`
  query ClickUpScopingCurrentFiltersQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        services {
          ... on ClickUpIntegrationService {
            repos {
              id
              name
              integrationRepoId
            }
          }
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
  const lists = data.viewer.teamMember?.services.flatMap(({repos}) => repos ?? []) ?? []
  const selectedListNames = searchFiltersByKey(state.filters, 'listIds').flatMap(
    (listId) => lists.find(({integrationRepoId}) => integrationRepoId === listId)?.name ?? []
  )
  return <>{selectedListNames.length ? selectedListNames.join(', ') : 'None'}</>
}

export default ClickUpScopingCurrentFilters
