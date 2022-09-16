import {getRelayHandleKey, RecordSourceSelectorProxy} from 'relay-runtime'

/*
 * Sometimes you want all the connections that currently exist.
 * This uses a bunch of relay interval data structures. Use with caution.
 */
const getAllConnections = (
  store: RecordSourceSelectorProxy,
  parentId: string,
  connection: string
) => {
  const connectionRecordPrefix = getRelayHandleKey('connection', connection, null)
  const mutator = (store as any).__recordSource.__mutator
  const parentRecord = mutator._base.get(parentId)
  if (!parentRecord) return []
  const childIds = Object.keys(parentRecord)
  return childIds
    .filter((id) => id.startsWith(connectionRecordPrefix))
    .map((childId) => store.get(mutator.getLinkedRecordID(parentId, childId)))
}

export default getAllConnections
