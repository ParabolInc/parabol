import type Atmosphere from '../../Atmosphere'

export const snackOnError =
  (atmosphere: Atmosphere, key?: string) => (error: {message: string}) => {
    const {message} = error
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: key ?? `mutationError:${message}`,
      message,
      autoDismiss: 5
    })
  }
