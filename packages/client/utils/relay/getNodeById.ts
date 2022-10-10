import {RecordProxy} from 'relay-runtime'
import filterNodesInConn from './filterNodesInConn'

const getNodeById = (nodeId: string, conn: RecordProxy) =>
  filterNodesInConn(conn, (node: RecordProxy) => node.getValue('id') === nodeId)[0]

export default getNodeById
