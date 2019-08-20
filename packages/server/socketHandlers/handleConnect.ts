import wsGraphQLHandler from './wsGraphQLHandler'
import {fromEpochSeconds} from '../utils/epochTime'
import handleDisconnect from './handleDisconnect'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import AuthToken from '../database/types/AuthToken'
import sendMessage from '../socketHelpers/sendMessage'
import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import encodeAuthToken from '../utils/encodeAuthToken'
import {Threshold} from 'parabol-client/types/constEnums'

const isTmsValid = (tmsFromDB: string[] = [], tmsFromToken: string[] = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false
  }
  return true
}

const sendFreshTokenIfNeeded = (connectionContext: ConnectionContext, tmsDB: string[]) => {
  const {authToken, socket} = connectionContext
  const {exp, tms} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration.getTime() - Date.now()
  const tmsIsValid = isTmsValid(tmsDB, tms)
  if (timeLeftOnToken < Threshold.REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = new AuthToken({...authToken, tms: tmsDB})
    connectionContext.authToken = nextAuthToken
    sendMessage(socket, ClientMessageTypes.GQL_DATA, {
      data: {
        notificationSubscription: {
          __typename: 'AuthTokenPayload',
          id: encodeAuthToken(nextAuthToken)
        }
      }
    })
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
