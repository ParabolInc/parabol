import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useGenerateInspirationItemsMutation as TGenerateInspirationItemsMutation} from '../__generated__/useGenerateInspirationItemsMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useGenerateInspirationItemsMutation($input: GenerateInspirationItemsInput!) {
    generateInspirationItems(input: $input) {
      meeting {
        id
      }
      inspirationItems {
        id
        content
        title
        service
        promptId
        createdAt
      }
      issues {
        service
        kind
        title
        url
        updatedAt
        unusedReason
        draft {
          id
          content
          promptId
        }
      }
      nextBefore
    }
  }
`

const useGenerateInspirationItemsMutation = () => {
  const [commit, submitting] = useMutation<TGenerateInspirationItemsMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TGenerateInspirationItemsMutation>) => {
    return commit({
      // allow components to override default config
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useGenerateInspirationItemsMutation
