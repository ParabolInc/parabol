/*
 * graphql-jit does not support subscriptions so
 * this is a separate cache that simply caches the document AST
 * to avoid parsing and validating on every request
 */

import {DocumentNode, parse} from 'graphql'
import getRethink from '../database/rethinkDriver'
import PROD from '../PROD'

export default class DocumentCache {
  store = {} as {[docId: string]: DocumentNode}
  private set(docId: string, ast: DocumentNode) {
    this.store[docId] = ast
  }
  async fromID(docId: string) {
    // looks up query string for a persisted query, parses into an AST, caches and returns it
    let document = this.store[docId]
    if (!document) {
      const r = await getRethink()
      let queryString = await r.table('QueryMap').get(docId)('query').default(null).run()
      if (!queryString && !PROD) {
        // In development, use the frequently changing queryMap to look up persisted queries by hash
        const queryMap = require('../../../queryMap.json')
        queryString = queryMap[docId]
      }
      if (!queryString) return undefined
      document = parse(queryString)
      this.set(docId, document)
    }
    return document
  }
  fromString(queryString: string) {
    // accepts query string, parses inot an AST, caches and returns it
    let document = this.store[queryString]
    if (!document) {
      document = parse(queryString)
      this.set(queryString, document)
    }
    return document
  }
}
