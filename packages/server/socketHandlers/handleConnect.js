import {REFRESH_JWT_AFTER} from '../utils/serverConstants'
import sendNewAuthToken from '../socketHelpers/sendNewAuthToken'
import wsGraphQLHandler from './wsGraphQLHandler'
import makeAuthTokenObj from '../utils/makeAuthTokenObj'
import {fromEpochSeconds} from '../utils/epochTime'
import handleDisconnect from './handleDisconnect'

const isTmsValid = (tmsFromDB = [], tmsFromToken = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false
  }
  return true
}

const sendFreshTokenIfNeeded = (connectionContext, tmsDB) => {
  const now = new Date()
  const {authToken} = connectionContext
  const {exp, tms} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration - now
  const tmsIsValid = isTmsValid(tmsDB, tms)
  if (timeLeftOnToken < REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = makeAuthTokenObj({...authToken, tms: tmsDB})
    connectionContext.authToken = nextAuthToken
    sendNewAuthToken(connectionContext.socket, nextAuthToken)
  }
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
    const {
      connectSocket: {tmsDB}
    } = data
    sendFreshTokenIfNeeded(connectionContext, tmsDB)
    return true
  }
  handleDisconnect(connectionContext, {exitCode: 4401})()
  return false
}

export default handleConnect
