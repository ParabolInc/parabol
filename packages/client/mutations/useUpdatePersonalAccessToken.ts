import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdatePersonalAccessTokenMutation as TuseUpdatePersonalAccessTokenMutation} from '../__generated__/useUpdatePersonalAccessTokenMutation.graphql'

const mutation = graphql`
  mutation useUpdatePersonalAccessTokenMutation(
    $tokenId: ID!
    $name: String
    $scopes: [OAuthScopeEnum!]
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
    $expiresAt: DateTime
  ) {
    updatePersonalAccessToken(
      tokenId: $tokenId
      name: $name
      scopes: $scopes
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
      expiresAt: $expiresAt
    ) {
      personalAccessToken {
        id
        name
        scopes
        grantedOrgIds
        grantedTeamIds
        grantedPageIds
        expiresAt
      }
    }
  }
`

export const useUpdatePersonalAccessToken = () => {
  const [commit, submitting] = useMutation<TuseUpdatePersonalAccessTokenMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePersonalAccessTokenMutation>) =>
    commit(config)
  return [execute, submitting] as const
}
