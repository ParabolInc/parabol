// Who know why, but sentry SWALLOWS GraphQLErrors. Here's the ugly workaround

const prepareErrorForSentry = (error: any) => {
  if (error.name === 'GraphQLError') {
    // cast so we can overload it with path/locations
    const syntheticError = new Error(error.message) as any
    syntheticError.stack = error.stack
    syntheticError.path = error.path
    syntheticError.locations = error.locations
    return syntheticError as Error
  }
  return error
}
