import getRethink from '../database/rethinkDriver'
import {parse, DocumentNode} from 'graphql'

const PROD = process.env.NODE_ENV === 'production'
export default class DocumentCache {
  store = {} as {[docId: string]: DocumentNode}
  private set(docId: string, ast: DocumentNode) {
    this.store[docId] = ast
  }
  async fromID(docId: string) {
    let document = this.store[docId]
    if (!document) {
      const r = await getRethink()
      let queryString = await r
        .table('QueryMap')
        .get(docId)('query')
        .default(null)
        .run()
      if (!queryString && !PROD) {
        const queryMap = require('./queryMap.json')
        queryString = queryMap[docId]
      }
      if (!queryString) return undefined
      document = parse(queryString)
      this.set(docId, document)
    }
    return document
  }
  fromString(queryString: string) {
    let document = this.store[queryString]
    if (!document) {
      document = parse(queryString)
      this.set(queryString, document)
    }
    return document
  }
}
