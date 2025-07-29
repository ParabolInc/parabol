import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordSourceSelectorProxy} from 'relay-runtime'
import type {useUpdateTeamSortOrderMutation as TuseUpdateTeamSortOrderMutation} from '../__generated__/useUpdateTeamSortOrderMutation.graphql'

const mutation = graphql`
  mutation useUpdateTeamSortOrderMutation($teamId: ID!, $sortOrder: String!) {
    updateTeamSortOrder(teamId: $teamId, sortOrder: $sortOrder) {
      team {
        sortOrder
      }
    }
  }
`

const handleUpdateSortOrder = (store: RecordSourceSelectorProxy) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const teams = viewer.getLinkedRecords('teams')
  if (!teams) return
  const nextTeams = teams.sort((a, b) =>
    (a.getValue('sortOrder') || '!') < (b.getValue('sortOrder') || '!') ? -1 : 1
  )
  viewer.setLinkedRecords(nextTeams, 'teams')
}

export const useUpdateTeamSortOrderMutation = () => {
  const [commit, submitting] = useMutation<TuseUpdateTeamSortOrderMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdateTeamSortOrderMutation>) => {
    return commit({
      ...config,
      updater(store) {
        handleUpdateSortOrder(store)
      },
      optimisticUpdater(store) {
        const {variables} = config
        const {teamId, sortOrder} = variables
        store.get(teamId)?.setValue(sortOrder, 'sortOrder')
        handleUpdateSortOrder(store)
      }
    })
  }
  return [execute, submitting] as const
}
