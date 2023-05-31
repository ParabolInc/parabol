import {useMutation, UseMutationConfig} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
//import SendClientSegmentEventMutation from './SendClientSegmentEventMutation'

type Handlers = {
  onSuccess?: (res: any, variables: any) => void
  onError?: (error: any) => void
}

export const useGenericMutation = (
  mutation: any,
  dataField: string,
  successMessage: string,
  errorMessage: string
  // TODO some segment config?
) => {
  const [commit, submitting] = useMutation(mutation)
  const atmosphere = useAtmosphere()

  const execute = (config: UseMutationConfig<any>, handlers?: Handlers) => {
    const {variables} = config
    return commit({
      onCompleted: (res: any) => {
        const error = res[dataField]?.error

        if (!error) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: successMessage,
            autoDismiss: 5,
            key: `${dataField}Success`
          })

          handlers?.onSuccess && handlers.onSuccess(res, variables)
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: errorMessage || error.message,
            autoDismiss: 5,
            key: `${dataField}Error`
          })
          handlers?.onError && handlers.onError(error)
        }
      },
      ...config
    })
  }

  return [execute, submitting] as const
}
