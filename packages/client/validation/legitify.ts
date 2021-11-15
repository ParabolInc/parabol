import Legitity from './Legitity'

const legitify = (expected: {[key: string]: any}) => (actual: any) => {
  if (Array.isArray(expected)) {
    const schema = legitify(expected[0])
    const data = [] as any[]
    const errors = [] as any[]
    let hasErrors = false
    for (let i = 0; i < (actual as any[]).length; i++) {
      const actualValue = actual[i]
      const res = schema(actualValue)
      data[i] = res.data
      // maybe we have to send in empties too
      if (Object.keys(res.errors).length > 0) {
        errors[i] = res.errors
        hasErrors = true
      }
    }
    return {errors: hasErrors && errors, data}
  }
  const data = {} as {[key: string]: any}
  const errors = {} as {[key: string]: any}
  if (typeof actual === 'object') {
    for (const [key, maybeValidator] of Object.entries(expected)) {
      const actualValue = actual[key]
      if (typeof maybeValidator === 'function') {
        const monadicVal = new Legitity(actualValue)
        const {error, value} = maybeValidator(monadicVal)
        if (Object.prototype.hasOwnProperty.call(actual, key)) {
          data[key] = value
        }
        if (error) {
          errors[key] = error
        }
      } else if (actualValue) {
        const schema = legitify(maybeValidator)
        const res = schema(actualValue)
        data[key] = res.data
        if (Object.keys(res.errors).length > 0) {
          errors[key] = res.errors
        }
      }
    }
  }
  return {errors, data}
}

export default legitify
