import {Disposable, UseMutationConfig} from 'react-relay'
import {MutationParameters} from 'relay-runtime'

export const mutationResult = <TMutation extends MutationParameters>(
  commit: (config: UseMutationConfig<TMutation>) => Disposable,
  config: UseMutationConfig<TMutation>
) => {
  return new Promise<TMutation['response']>((resolve, reject) => {
    commit({
      ...config,
      onCompleted: resolve,
      onError: reject
    })
  })
}
