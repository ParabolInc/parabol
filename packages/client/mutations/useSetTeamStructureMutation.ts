import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {useSetTeamStructureMutation as TSetTeamStructureMutation} from '../__generated__/useSetTeamStructureMutation.graphql'

const mutation = graphql`
  mutation useSetTeamStructureMutation($orgId: ID!, $levels: [TeamStructureLevelInput!]!) {
    setTeamStructure(orgId: $orgId, levels: $levels) {
      organization {
        id
        teamStructure {
          id
          name
          values {
            id
            name
            teamIds
          }
        }
      }
    }
  }
`

const isRecord = (record: RecordProxy | null | undefined): record is RecordProxy => !!record

const useSetTeamStructureMutation = () => {
  const [commit, submitting] = useMutation<TSetTeamStructureMutation>(mutation)
  const execute = (config: UseMutationConfig<TSetTeamStructureMutation>) => {
    const {orgId, levels} = config.variables
    return commit({
      // levels and values that already exist move, rename and go at once. New ones wait for their ids
      optimisticUpdater: (store) => {
        const levelRecords = levels
          .map((level) => {
            const levelRecord = level.id ? store.get(level.id) : null
            if (!levelRecord) return null
            const valueRecords = level.values
              .map((value) => {
                const valueRecord = value.id ? store.get(value.id) : null
                return valueRecord?.setValue(value.name, 'name')
              })
              .filter(isRecord)
            return levelRecord.setValue(level.name, 'name').setLinkedRecords(valueRecords, 'values')
          })
          .filter(isRecord)
        store.get(orgId)?.setLinkedRecords(levelRecords, 'teamStructure')
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useSetTeamStructureMutation
