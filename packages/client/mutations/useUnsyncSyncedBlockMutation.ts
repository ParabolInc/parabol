import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUnsyncSyncedBlockMutation as TUnsyncSyncedBlockMutation} from '../__generated__/useUnsyncSyncedBlockMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'
import {handleArchivePage} from './useArchivePageMutation'

const mutation = graphql`
  mutation useUnsyncSyncedBlockMutation($pageId: ID!) {
    unsyncSyncedBlock(pageId: $pageId) {
      page {
        id
        title
        deletedAt
        deletedBy
        isSyncedBlock
        isPrivate
        parentPageId
        teamId
      }
    }
  }
`

export const useUnsyncSyncedBlockMutation = () => {
  const [commit, submitting] = useMutation<TUnsyncSyncedBlockMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUnsyncSyncedBlockMutation>) =>
    commit({
      updater: (store) => {
        if (!store.getRootField('unsyncSyncedBlock')) return
        handleArchivePage(config.variables.pageId, {store, isHardDelete: false})
      },
      onError: snackOnError(atmosphere),
      ...config
    })
  return [execute, submitting] as const
}
