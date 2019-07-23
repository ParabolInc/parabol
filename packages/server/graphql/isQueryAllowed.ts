import {isSuperUser} from 'server/utils/authorization'
import ConnectionContext from '../socketHelpers/ConnectionContext'

const PROD = process.env.NODE_ENV === 'production'

const isQueryAllowed = (_query: string, connectionContext: ConnectionContext) => {
  return !PROD || isSuperUser(connectionContext.authToken)
}

export default isQueryAllowed
