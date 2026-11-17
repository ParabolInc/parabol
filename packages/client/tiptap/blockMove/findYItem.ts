import * as Y from 'yjs'

export const findYItem = (doc: Y.Doc, client: number, clock: number) => {
  try {
    const item = Y.getItem(doc.store, Y.createID(client, clock))
    return item instanceof Y.Item ? item : undefined
  } catch {
    return undefined
  }
}
