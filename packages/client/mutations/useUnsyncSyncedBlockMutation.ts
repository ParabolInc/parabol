import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUnsyncSyncedBlockMutation as TUnsyncSyncedBlockMutation} from '../__generated__/useUnsyncSyncedBlockMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useUnsyncSyncedBlockMutation($pageId: ID!) {
    unsyncSyncedBlock(pageId: $pageId) {
      page {
        id
        deletedAt
        isSyncedBlock
      }
    }
  }
`

export const useUnsyncSyncedBlockMutation = () => {
  const [commit, submitting] = useMutation<TUnsyncSyncedBlockMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUnsyncSyncedBlockMutation>) =>
    commit({onError: snackOnError(atmosphere), ...config})
  return [execute, submitting] as const
}
