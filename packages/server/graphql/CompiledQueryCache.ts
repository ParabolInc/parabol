import tracer from 'dd-trace'
import {GraphQLSchema, parse} from 'graphql'
import {CompiledQuery} from 'graphql-jit'
import getKysely from '../postgres/getKysely'
import {MutationResolvers, QueryResolvers, Resolver} from './public/resolverTypes'
import {tracedCompileQuery} from './traceGraphQL'
import sendToSentry from '../utils/sendToSentry'

type OperationResolvers = QueryResolvers & MutationResolvers
type ExtractArgs<T> = T extends Resolver<any, any, any, infer Args> ? Args : never
type ExcludedArgs = {
  [P in keyof OperationResolvers]?: Array<keyof ExtractArgs<OperationResolvers[P]>>
}

const compileQuery = tracedCompileQuery(tracer, {
  excludeArgs: {
    acceptTeamInvitation: ['invitationToken'],
    loginWithPassword: ['password'],
    resetPassword: ['token', 'newPassword'],
    signUpWithPassword: ['password', 'invitationToken'],
    oldUpdateCreditCard: ['stripeToken'],
    verifyEmail: ['verificationToken']
  } as ExcludedArgs,
  hooks: {
    execute: (span, args) => {
      span.setTag('viewerId', args.contextValue?.authToken?.sub ?? 'null')
    }
  }
})
export default class CompiledQueryCache {
  store = {} as {[docId: string]: CompiledQuery}
  private set(docId: string, queryString: string, schema: GraphQLSchema) {
    try {
      const document = parse(queryString)
      const compiledQuery = compileQuery(schema, document)
      if (!('query' in compiledQuery)) {
        sendToSentry(new Error('Error compiling query'))
        return null
      }
      this.store[docId] = compiledQuery
      return compiledQuery
    } catch (e) {
      return null
    }
  }
  async fromID(docId: string, schema: GraphQLSchema) {
    const compiledQuery = this.store[docId]
    if (compiledQuery) return compiledQuery
    const pg = getKysely()
    const queryStringRes = await pg
      .selectFrom('QueryMap')
      .select('query')
      .where('id', '=', docId)
      .executeTakeFirst()
    let queryString = queryStringRes?.query
    if (!queryString && !__PRODUCTION__) {
      // try/catch block required for building the toolbox
      try {
        const queryMap = require('../../../queryMap.json')
        queryString = queryMap[docId]
      } catch (e) {
        return undefined
      }
    }
    if (!queryString) return undefined
    return this.set(docId, queryString, schema)
  }

  fromString(queryString: string, schema: GraphQLSchema) {
    return this.store[queryString] || this.set(queryString, queryString, schema)
  }
}
