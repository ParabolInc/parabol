import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRevokeOAuthAPIGrantFromOrgMutation as TRevokeOAuthAPIGrantFromOrgMutation} from '../__generated__/useRevokeOAuthAPIGrantFromOrgMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useRevokeOAuthAPIGrantFromOrgMutation($grantId: ID!, $orgId: ID!) {
    revokeOAuthAPIGrantFromOrg(grantId: $grantId, orgId: $orgId) {
      organization {
        id
        ...OrgAIAppsPolicyPanel_organization
        ...OrgAIAppConnections_organization
      }
    }
  }
`

const useRevokeOAuthAPIGrantFromOrgMutation = () => {
  const [commit, submitting] = useMutation<TRevokeOAuthAPIGrantFromOrgMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TRevokeOAuthAPIGrantFromOrgMutation>) => {
    const showError = snackOnError(atmosphere, 'revokeOAuthAPIGrantFromOrgError')
    return commit({
      onError: showError,
      ...config,
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error)
          return
        }
        config.onCompleted?.(res, errors)
      }
    })
  }
  return [execute, submitting] as const
}

export default useRevokeOAuthAPIGrantFromOrgMutation
