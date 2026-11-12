import type Atmosphere from '../../Atmosphere'
import getMutationError from '../../utils/relay/getMutationError'

export const snackOnError = (atmosphere: Atmosphere, key?: string) => (error: Error) => {
  const {message} = getMutationError(error)
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: key ?? `mutationError:${message}`,
    message,
    autoDismiss: 5
  })
}
