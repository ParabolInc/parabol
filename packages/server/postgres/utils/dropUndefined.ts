// Removed keys are deleted in rethink while they are undefined in postgres
export function dropUndefined(object: unknown) {
  if (typeof object === 'object' && object !== null) {
    Object.keys(object).forEach((key) => {
      if (object[key] === undefined) {
        delete object[key]
      }
    })
  }
}
