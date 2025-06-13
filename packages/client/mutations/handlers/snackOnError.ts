import type Atmosphere from '../../Atmosphere'

export const snackOnError = (atmosphere: Atmosphere, key?: string) => (error: any) => {
  const firstError = error?.source?.errors?.[0]?.message
  if (firstError) {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: key ?? 'mutationError',
      message: firstError,
      autoDismiss: 5
    })
  }
}
