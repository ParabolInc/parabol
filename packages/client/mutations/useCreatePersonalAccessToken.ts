import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useCreatePersonalAccessTokenMutation as TuseCreatePersonalAccessTokenMutation} from '../__generated__/useCreatePersonalAccessTokenMutation.graphql'

const mutation = graphql`
  mutation useCreatePersonalAccessTokenMutation(
    $label: String!
    $scopes: [OAuthScopeEnum!]!
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(
      label: $label
      scopes: $scopes
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
      expiresAt: $expiresAt
    ) {
      token
      personalAccessToken {
        id
        label
        prefix
        scopes
        grantedOrgIds
        grantedTeamIds
        grantedPageIds
        createdAt
        lastUsedAt
        expiresAt
        revokedAt
      }
    }
  }
`

export const useCreatePersonalAccessToken = () => {
  const [commit, submitting] = useMutation<TuseCreatePersonalAccessTokenMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseCreatePersonalAccessTokenMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('createPersonalAccessToken')
        if (!payload) return
        const newToken = payload.getLinkedRecord('personalAccessToken')
        if (!newToken) return
        const viewer = store.getRoot().getLinkedRecord('viewer')!
        const existingTokens = viewer.getLinkedRecords('personalAccessTokens') ?? []
        viewer.setLinkedRecords([...existingTokens, newToken], 'personalAccessTokens')
      },
      ...config
    })
  }
  return [execute, submitting] as const
}
