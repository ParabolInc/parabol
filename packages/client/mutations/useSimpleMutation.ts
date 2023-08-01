import {useMutation, UseMutationConfig} from 'react-relay'
import {GraphQLTaggedNode, MutationParameters, PayloadError} from 'relay-runtime'
import getGraphQLError from '../utils/relay/getGraphQLError'

export interface SimpleMutationConfig<TMutation extends MutationParameters>
  extends UseMutationConfig<TMutation> {
  onSuccess?: (response: TMutation['response']) => void
  onFailure?: (error: Error) => void
}

export const useSimpleMutation = <TMutation extends MutationParameters>(
  mutation: GraphQLTaggedNode
) => {
  const [commit, submitting] = useMutation<TMutation>(mutation)

  const execute = (config: SimpleMutationConfig<TMutation>) => {
    const {variables, onSuccess, onFailure} = config
    return commit({
      variables,
      onCompleted: (res: TMutation['response'], errors: PayloadError[] | null) => {
        const error = getGraphQLError(res, errors)

        if (!error) {
          onSuccess && onSuccess(res)
        } else {
          onFailure && onFailure(error)
        }
      }
    })
  }

  return [execute, submitting] as const
}
