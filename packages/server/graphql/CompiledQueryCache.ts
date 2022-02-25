import tracer from 'dd-trace'
import {GraphQLSchema, parse} from 'graphql'
import {CompiledQuery} from 'graphql-jit'
import getRethink from '../database/rethinkDriver'
import PROD from '../PROD'
import {tracedCompileQuery} from './traceGraphQL'

const compileQuery = tracedCompileQuery(tracer, {
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
      if (!('query' in compiledQuery)) return null
      this.store[docId] = compiledQuery
      return compiledQuery
    } catch (e) {
      return null
    }
  }
  async fromID(docId: string, schema: GraphQLSchema) {
    const compiledQuery = this.store[docId]
    if (compiledQuery) return compiledQuery
    const r = await getRethink()
    let queryString = await r.table('QueryMap').get(docId)('query').default(null).run()
    if (!queryString && !PROD) {
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
