import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateOrgAIAppsPolicyMutation as TUpdateOrgAIAppsPolicyMutation} from '../__generated__/useUpdateOrgAIAppsPolicyMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useUpdateOrgAIAppsPolicyMutation($orgId: ID!, $policy: OrgAIAppsPolicyEnum!) {
    updateOrgAIAppsPolicy(orgId: $orgId, policy: $policy) {
      organization {
        id
        aiAppsPolicy
      }
    }
  }
`

const useUpdateOrgAIAppsPolicyMutation = () => {
  const [commit, submitting] = useMutation<TUpdateOrgAIAppsPolicyMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateOrgAIAppsPolicyMutation>) => {
    const {orgId, policy} = config.variables
    const showError = snackOnError(atmosphere, 'updateOrgAIAppsPolicyError')
    return commit({
      optimisticResponse: {
        updateOrgAIAppsPolicy: {organization: {id: orgId, aiAppsPolicy: policy}}
      },
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

export default useUpdateOrgAIAppsPolicyMutation
