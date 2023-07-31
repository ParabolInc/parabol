import {useMutation, UseMutationConfig} from 'react-relay'
import {
  getRequest,
  NormalizationLinkedField,
  NormalizationScalarField,
  GraphQLTaggedNode,
  MutationParameters
} from 'relay-runtime'

export interface SimpleMutationConfig<TMutation extends MutationParameters>
  extends UseMutationConfig<TMutation> {
  onSuccess?: (response: TMutation['response']) => void
  onFailure?: (error: Error) => void
}

interface ResponseWithError {
  [key: string]: {
    error?: Error
  }
}

export const useSimpleMutation = <TMutation extends MutationParameters>(
  mutation: GraphQLTaggedNode
) => {
  const [commit, submitting] = useMutation<TMutation>(mutation)
  const firstSelection = getRequest(mutation).operation.selections[0] as
    | NormalizationLinkedField
    | NormalizationScalarField
  const dataField = firstSelection.alias || firstSelection.name

  const execute = (config: SimpleMutationConfig<TMutation>) => {
    const {variables, onSuccess, onFailure} = config
    return commit({
      variables,
      onCompleted: (res: TMutation['response']) => {
        const error = (res as ResponseWithError)[dataField]?.error

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
