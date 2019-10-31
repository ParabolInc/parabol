import wsGraphQLHandler from './wsGraphQLHandler'
import {fromEpochSeconds} from '../utils/epochTime'
import handleDisconnect from './handleDisconnect'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import AuthToken from '../database/types/AuthToken'
import encodeAuthToken from '../utils/encodeAuthToken'
import {Threshold} from 'parabol-client/types/constEnums'
import sendToSentry from '../utils/sendToSentry'

const isTmsValid = (tmsFromDB: string[] = [], tmsFromToken: string[] = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false
  }
  return true
}

const setFreshTokenIfNeeded = (connectionContext: ConnectionContext, tmsDB: string[]) => {
  const {authToken} = connectionContext
  const {exp, tms} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration.getTime() - Date.now()
  const tmsIsValid = isTmsValid(tmsDB, tms)
  if (timeLeftOnToken < Threshold.REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = new AuthToken({...authToken, tms: tmsDB})
    connectionContext.authToken = nextAuthToken
    return encodeAuthToken(nextAuthToken)
  }
  return null
}

const handleConnect = async (connectionContext) => {
  const payload = {
    query: `
    mutation ConnectSocket {
      connectSocket {
        tmsDB: tms
      }
    }
  `
  }

  const result = await wsGraphQLHandler(connectionContext, payload)
  const {data} = result
  if (data) {
    if (!data.connectSocket) {
      sendToSentry(new Error('null connectSocket'), {userId: connectionContext.userId})
    }
    const {
      connectSocket: {tmsDB}
    } = data
    return setFreshTokenIfNeeded(connectionContext, tmsDB)
  }
  handleDisconnect(connectionContext, {exitCode: 4401})()
  return null
}

export default handleConnect
