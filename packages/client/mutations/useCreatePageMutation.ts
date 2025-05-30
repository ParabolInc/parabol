import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import {useCreatePageMutation as TCreatePageMutation} from '../__generated__/useCreatePageMutation.graphql'
import safePutNodeInConn from './handlers/safePutNodeInConn'
import {isPrivatePageConnectionLookup} from './useUpdatePageMutation'

const mutation = graphql`
  mutation useCreatePageMutation($parentPageId: ID, $teamId: ID) {
    createPage(parentPageId: $parentPageId, teamId: $teamId) {
      page {
        id
        title
        isPrivate
        sortOrder
        teamId
        parentPageId
      }
    }
  }
`

export const useCreatePageMutation = () => {
  const [commit, submitting] = useMutation<TCreatePageMutation>(mutation)
  const execute = (config: UseMutationConfig<TCreatePageMutation>) => {
    const {variables} = config
    const {parentPageId, teamId} = variables
    return commit({
      updater: (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        if (!viewer) return
        const connectionKey = parentPageId || teamId ? 'User_pages' : 'User_privatePages'
        const conn = ConnectionHandler.getConnection(viewer, connectionKey, {
          parentPageId: parentPageId || undefined,
          teamId: teamId || undefined,
          isPrivate: isPrivatePageConnectionLookup[connectionKey]
        })!
        const node = store.getRootField('createPage')?.getLinkedRecord('page')
        safePutNodeInConn(conn, node, store, 'sortOrder', true)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}
