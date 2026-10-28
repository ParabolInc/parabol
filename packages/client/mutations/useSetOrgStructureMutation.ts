import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {useSetOrgStructureMutation as TSetOrgStructureMutation} from '../__generated__/useSetOrgStructureMutation.graphql'

const mutation = graphql`
  mutation useSetOrgStructureMutation($orgId: ID!, $levels: [OrgStructureLevelInput!]!) {
    setOrgStructure(orgId: $orgId, levels: $levels) {
      organization {
        id
        structure {
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

const useSetOrgStructureMutation = () => {
  const [commit, submitting] = useMutation<TSetOrgStructureMutation>(mutation)
  const execute = (config: UseMutationConfig<TSetOrgStructureMutation>) => {
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
        store.get(orgId)?.setLinkedRecords(levelRecords, 'structure')
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useSetOrgStructureMutation
