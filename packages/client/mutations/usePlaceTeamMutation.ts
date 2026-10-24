import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {usePlaceTeamMutation as TPlaceTeamMutation} from '../__generated__/usePlaceTeamMutation.graphql'

const mutation = graphql`
  mutation usePlaceTeamMutation($teamId: ID!, $levelId: ID!, $valueId: ID) {
    placeTeam(teamId: $teamId, levelId: $levelId, valueId: $valueId) {
      organization {
        id
        teamStructure {
          id
          values {
            id
            teamIds
          }
        }
      }
    }
  }
`

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const usePlaceTeamMutation = () => {
  const [commit, submitting] = useMutation<TPlaceTeamMutation>(mutation)
  const execute = (config: UseMutationConfig<TPlaceTeamMutation>) => {
    const {teamId, levelId, valueId} = config.variables
    return commit({
      // the menu shows the new value as soon as it closes
      optimisticUpdater: (store) => {
        store
          .get(levelId)
          ?.getLinkedRecords('values')
          ?.forEach((value) => {
            const teamIds = value.getValue('teamIds')
            const otherTeamIds = isStringList(teamIds) ? teamIds.filter((id) => id !== teamId) : []
            const isPlacedHere = value.getDataID() === valueId
            value.setValue(isPlacedHere ? [...otherTeamIds, teamId] : otherTeamIds, 'teamIds')
          })
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default usePlaceTeamMutation
