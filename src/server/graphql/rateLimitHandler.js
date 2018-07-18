import type {OperationDefinitionNode} from 'graphql'
import {visit} from 'graphql'
import rateLimiter from 'server/graphql/RateLimiter'
import {sendRateLimitReachedError} from 'server/utils/authorizationErrors'

const opLookup = {
  query: 'getQueryType',
  mutation: 'getMutationType',
  subscription: 'getSubscriptionType'
}

// There's no way to assign a directive without using the IDL, so we're doing it live
// https://github.com/graphql/graphql-js/issues/1343
const getDirective = (directives) => directives && directives.find(({name}) => name === 'rateLimit')

const rateLimitHandler = async (doc, schema, userId) => {
  return visit(doc, {
    OperationDefinition: {
      enter: (operation: OperationDefinitionNode) => {
        const method = opLookup[operation.operation]
        const fields = schema[method]().getFields()
        const {selections} = operation.selectionSet
        for (let ii = 0; ii < selections.length; ii++) {
          const selection = selections[ii]
          if (selection.kind !== 'Field') continue
          const field = fields[selection.name.value]
          const directive = getDirective(field.directives)
          if (!directive) continue
          const {name} = field
          const {perMinute, perHour} = directive.args
          const {lastHour, lastMinute} = rateLimiter.add(userId, name, perHour)
          if (lastMinute > perMinute || lastHour > perHour) {
            // if (lastMinute > perMinute + 10) {
            // TODO blacklist token so they must log in again
            // }
            sendRateLimitReachedError(userId, name, lastMinute, lastHour)
            throw new Error(name)
          }
        }
      }
    }
  })
}

export default rateLimitHandler
