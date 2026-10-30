import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {usePlaceTeamMutation as TPlaceTeamMutation} from '../__generated__/usePlaceTeamMutation.graphql'

const mutation = graphql`
  mutation usePlaceTeamMutation($teamId: ID!, $levelId: ID!, $valueId: ID) {
    placeTeam(teamId: $teamId, levelId: $levelId, valueId: $valueId) {
      organization {
        id
        structure {
          id
          values {
            id
            teams {
              id
            }
          }
        }
      }
    }
  }
`

const usePlaceTeamMutation = () => {
  const [commit, submitting] = useMutation<TPlaceTeamMutation>(mutation)
  const execute = (config: UseMutationConfig<TPlaceTeamMutation>) => {
    const {teamId, levelId, valueId} = config.variables
    return commit({
      // the menu shows the new value as soon as it closes
      optimisticUpdater: (store) => {
        const team = store.get(teamId)
        store
          .get(levelId)
          ?.getLinkedRecords('values')
          ?.forEach((value) => {
            const otherTeams = (value.getLinkedRecords('teams') ?? []).filter(
              (placedTeam) => placedTeam.getDataID() !== teamId
            )
            const isPlacedHere = value.getDataID() === valueId && team
            value.setLinkedRecords(isPlacedHere ? [...otherTeams, team] : otherTeams, 'teams')
          })
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default usePlaceTeamMutation
