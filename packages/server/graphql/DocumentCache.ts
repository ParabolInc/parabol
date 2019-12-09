import getRethink from '../database/rethinkDriver'
import {parse, DocumentNode} from 'graphql'

export default class DocumentCache {
  store = {} as {[docId: string]: DocumentNode}
  private set(docId: string, ast: DocumentNode) {
    this.store[docId] = ast
  }
  async fromID(docId: string) {
    let document = this.store[docId]
    if (!document) {
      const r = await getRethink()
      const queryString = await r
        .table('QueryMap')
        .get(docId)('query')
        .default(null)
        .run()
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
