import {PayloadError} from 'relay-runtime/lib/network/RelayNetworkTypes'

const getServerError = (errors: ReadonlyArray<PayloadError> | null | undefined) =>
  (errors && errors[0]) || undefined
const getPayloadError = (res: {[key: string]: any} | null) => {
  if (!res) return undefined
  const payload = Object.values(res)[0]
  return payload && payload.error
}

const getGraphQLError = (
  res: {[key: string]: any} | null,
  errors: ReadonlyArray<PayloadError> | null | undefined
) => {
  return getPayloadError(res) || getServerError(errors)
}

export default getGraphQLError
