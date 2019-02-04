import {isSuperUser} from 'server/utils/authorization'
import ConnectionContext from '../socketHelpers/ConnectionContext'

const isQueryAllowed = (_query: string, connectionContext: ConnectionContext) => {
  return isSuperUser(connectionContext.authToken)
}

export default isQueryAllowed
