// https://github.com/DataDog/dd-trace-js/blob/master/packages/datadog-plugin-graphql/src/utils.js
// Removed graphqlErrorExtensions piece

import type {opentelemetry} from 'dd-trace'
import type {GraphQLError} from 'graphql'

type Attributes = {
  type?: string
  stacktrace?: string
  locations?: string[]
  path?: string[]
  message?: string
}

export function extractErrorIntoSpanEvent(span: opentelemetry.Span, exc: GraphQLError) {
  const attributes: Attributes = {}

  if (exc.name) {
    attributes.type = exc.name
  }

  if (exc.stack) {
    attributes.stacktrace = exc.stack
  }

  if (exc.locations) {
    attributes.locations = []
    for (const location of exc.locations) {
      attributes.locations.push(`${location.line}:${location.column}`)
    }
  }

  if (exc.path) {
    attributes.path = exc.path.map(String)
  }

  if (exc.message) {
    attributes.message = exc.message
  }

  span.addEvent('dd.graphql.query.error', attributes, Date.now())
}
