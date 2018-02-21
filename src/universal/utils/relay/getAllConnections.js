import getRelayHandleKey from 'relay-runtime/lib/getRelayHandleKey';

/*
 * Sometimes you want all the connections that currently exist.
 * This uses a bunch of relay interval data structures. Use with caution.
 */
const getAllConnections = (store, viewerId, connection) => {
  const connectionRecordPrefix = getRelayHandleKey('connection', connection, null);
  const mutator = store.__recordSource.__mutator;
  const viewerRecord = mutator._base.get(viewerId);
  if (!viewerRecord) return [];
  const viewerIds = Object.keys(viewerRecord);
  return viewerIds
    .filter((id) => id.startsWith(connectionRecordPrefix))
    .map((viewerRecordId) => store.get(mutator.getLinkedRecordID(viewerId, viewerRecordId)))
};

export default getAllConnections;
