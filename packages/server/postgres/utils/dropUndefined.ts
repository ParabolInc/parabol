// Removed keys are deleted in rethink while they are undefined in postgres
export function dropUndefined(object: unknown) {
  Object.keys(object).forEach((key) => {
    if (object[key] === undefined) {
      delete object[key]
    }
  })
}
