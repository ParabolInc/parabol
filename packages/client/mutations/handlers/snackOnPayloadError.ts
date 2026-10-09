import type {PayloadError} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'

// Atmosphere delivers a GraphQLError that the server threw to onCompleted rather than to onError
export const snackOnPayloadError =
  <TResponse>(
    atmosphere: Atmosphere,
    key: string,
    onCompleted?: (response: TResponse, errors: PayloadError[] | null) => void
  ) =>
  (response: TResponse, errors: PayloadError[] | null) => {
    const message = errors?.[0]?.message
    if (message) {
      atmosphere.eventEmitter.emit('addSnackbar', {key, message, autoDismiss: 5})
      return
    }
    onCompleted?.(response, errors)
  }
