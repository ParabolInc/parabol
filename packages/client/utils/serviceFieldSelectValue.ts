import {SprintPokerDefaults} from '../types/constEnums'

// radix reserves '' to mean "nothing is selected", so the "Do Not Update" option needs a
// non-empty stand-in for as long as it lives inside a Select
export const SERVICE_FIELD_NULL_VALUE = '__doNotUpdate'

export const toSelectValue = (serviceFieldName: string) =>
  serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL
    ? SERVICE_FIELD_NULL_VALUE
    : serviceFieldName

export const fromSelectValue = (selectValue: string): string =>
  selectValue === SERVICE_FIELD_NULL_VALUE ? SprintPokerDefaults.SERVICE_FIELD_NULL : selectValue
