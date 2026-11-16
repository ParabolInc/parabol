import {ConnectionHandler} from 'relay-runtime'

const createPageConnection = (
  viewerId: string,
  key: string,
  filters: Record<string, unknown>,
  nodeIds: string[]
) => {
  const connId = ConnectionHandler.getConnectionID(viewerId, key, filters)
  const storageKey = connId.slice(`client:${viewerId}:`.length)
  const edgeIds = nodeIds.map((nodeId) => `${connId}:edge:${nodeId}`)
  const records = Object.fromEntries([
    [
      connId,
      {
        __id: connId,
        __typename: 'PageConnection',
        edges: {__refs: edgeIds},
        pageInfo: null
      }
    ],
    ...nodeIds.map((nodeId, idx) => [
      edgeIds[idx],
      {__id: edgeIds[idx], __typename: 'PageEdge', cursor: null, node: {__ref: nodeId}}
    ])
  ])
  return {storageKey, connId, records}
}

export default createPageConnection
