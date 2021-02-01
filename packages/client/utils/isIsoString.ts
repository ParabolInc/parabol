import moment from 'moment'

const isIsoString = (value: any): boolean => {
  return (
    typeof value === 'string' &&
    moment(value, moment.ISO_8601).isValid()
  )
}

export default isIsoString
