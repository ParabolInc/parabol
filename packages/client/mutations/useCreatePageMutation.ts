import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {useCreatePageMutation as TCreatePageMutation} from '../__generated__/useCreatePageMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import safePutNodeInConn from './handlers/safePutNodeInConn'
import {snackOnError} from './handlers/snackOnError'
import {isPrivatePageConnectionLookup} from './useUpdatePageMutation'

graphql`
  fragment useCreatePageMutation_notification on CreatePagePayload {
    page {
      id
      title
      isPrivate
      sortOrder
      teamId
      parentPageId
      ...LeftNavPageLink_page
    }
  }
`

const mutation = graphql`
  mutation useCreatePageMutation($teamId: ID) {
    createPage(teamId: $teamId) {
      ...useCreatePageMutation_notification @relay(mask: false)
    }
  }
`
export const handleCreatePage = (
  page: RecordProxy,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const teamId = page.getValue('teamId')
  const parentPageId = page.getValue('parentPageId')
  const connectionKey = parentPageId || teamId ? 'User_pages' : 'User_privatePages'
  const conn = ConnectionHandler.getConnection(viewer, connectionKey, {
    parentPageId: parentPageId || null,
    teamId: teamId || undefined,
    isPrivate: isPrivatePageConnectionLookup[connectionKey]
  })!
  safePutNodeInConn(conn, page, store, 'sortOrder', true)
}

export const useCreatePageMutation = () => {
  const [commit, submitting] = useMutation<TCreatePageMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TCreatePageMutation>) => {
    return commit({
      updater: (store) => {
        const page = store.getRootField('createPage')?.getLinkedRecord('page')
        handleCreatePage(page, {store})
      },
      onError: snackOnError(atmosphere, 'createPageErr'),
      ...config
    })
  }
  return [execute, submitting] as const
}
