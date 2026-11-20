import {isClientOutdated} from '../utils/connectedServerVersion'

// The server nulls a payload it failed to resolve. A client older than the server never selected the fields a newer release publishes
const logMissingSubscriptionField = (fieldName: string) => {
  const log = isClientOutdated() ? console.warn : console.error
  log('Notification Subscription Payload received without field:', fieldName)
}

export default logMissingSubscriptionField
