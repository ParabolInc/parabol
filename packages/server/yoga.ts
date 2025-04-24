import {useDeferStream} from '@graphql-yoga/plugin-defer-stream'
import {usePersistedOperations} from '@graphql-yoga/plugin-persisted-operations'
import type {GraphQLParams} from 'graphql-yoga'
import {createYoga, useReadinessCheck} from 'graphql-yoga'
import {sql} from 'kysely'
import uws from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import AuthToken from './database/types/AuthToken'
import {getIsBusy} from './getIsBusy'
import {getIsShuttingDown} from './getIsShuttingDown'
import getRateLimiter from './graphql/getRateLimiter'
import {MutationResolvers, QueryResolvers, Resolver} from './graphql/public/resolverTypes'
import rootSchema from './graphql/public/rootSchema'
import getKysely from './postgres/getKysely'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {useDatadogTracing} from './utils/useDatadogTracing'
import {useDisposeDataloader} from './utils/useDisposeDataloader'
import {usePrivateSchemaForSuperUser} from './utils/usePrivateSchemaForSuperUser'

type OperationResolvers = QueryResolvers & MutationResolvers
type ExtractArgs<T> = T extends Resolver<any, any, any, infer Args> ? Args : never
type ExcludedArgs = {
  [P in keyof OperationResolvers]?: Array<keyof ExtractArgs<OperationResolvers[P]>>
}

export interface ServerContext {
  req: uws.HttpRequest
  res: uws.HttpResponse
  ip: string
  authToken: AuthToken | null
}

export interface UserContext {
  rateLimiter: ReturnType<typeof getRateLimiter>
}

export const extractPersistedOperationId = (
  params: GraphQLParams & {docId?: string; operationName?: string | null}
) => {
  return params.docId!
}

const queryMap = {} as Record<string, string | undefined>
const primeQueryMap = () => {
  if (__PRODUCTION__) return
  const primed = require('../../queryMap.json')
  Object.keys(primed).forEach((key) => {
    queryMap[key] = primed[key].replace('@stream_HACK', '@stream')
  })
}
primeQueryMap()

export const getPersistedOperation = async (docId: string) => {
  let queryString = queryMap[docId]
  if (!queryString) {
    const queryStringRes = await getKysely()
      .selectFrom('QueryMap')
      .select('query')
      .where('id', '=', docId)
      .executeTakeFirst()
    // Relay only supports @stream internally, so we call it @stream_HACK
    // so relay will compile it & ignore it on the client
    queryString = queryStringRes?.query.replace('@stream_HACK', '@stream')
    if (queryString) {
      queryMap[docId] = queryString
    }
  }
  return queryString || null
}

export const yoga = createYoga<ServerContext, UserContext>({
  graphqlEndpoint: '/graphql',
  landingPage: false,
  plugins: [
    useDatadogTracing({
      excludeArgs: {
        acceptTeamInvitation: ['invitationToken'],
        loginWithPassword: ['password'],
        resetPassword: ['token', 'newPassword'],
        signUpWithPassword: ['password', 'invitationToken'],
        verifyEmail: ['verificationToken']
      } as ExcludedArgs,
      hooks: {
        execute: (span, args) => {
          const userId = args.contextValue.authToken?.sub
          if (userId) {
            span.setTag('userId', userId)
          }
        }
      },
      collapse: true
    }),
    useDeferStream(),
    usePersistedOperations({
      allowArbitraryOperations(request) {
        const {headers} = request
        const authHeader = headers.get('authorization')
        const token = authHeader?.slice(7)
        const authToken = getVerifiedAuthToken(token)
        const isSuperUser = authToken?.rol === 'su'
        return isSuperUser
      },
      skipDocumentValidation: true,
      extractPersistedOperationId,
      getPersistedOperation
    }),
    usePrivateSchemaForSuperUser,
    useDisposeDataloader,
    useReadinessCheck({
      check: async () => {
        const isUnavailable = getIsShuttingDown() || getIsBusy()
        if (isUnavailable) return false
        const res = await Promise.race([sql`SELECT 1`.execute(getKysely()), sleep(5000)])
        if (!res) return false
        return true
      }
    })
  ],
  // There is a bug in graphql-yoga where calling `yoga.getEnveloped` does not work from within graphql-ws when `schema` returns a function
  // As a workaround, we set the schema via `usePrivateSchemaForSuperUser` using the `onEnveloped` hook
  schema: rootSchema,

  context: () => {
    const rateLimiter = getRateLimiter()
    return {rateLimiter}
  }
})
