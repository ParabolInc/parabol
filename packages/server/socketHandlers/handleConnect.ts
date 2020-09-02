import {Threshold} from 'parabol-client/types/constEnums'
import AuthToken from '../database/types/AuthToken'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import encodeAuthToken from '../utils/encodeAuthToken'
import {fromEpochSeconds} from '../utils/epochTime'
import publishInternalGQL from '../utils/publishInternalGQL'
import getRedis from '../utils/getRedis'

const isTmsValid = (tmsFromDB: string[] = [], tmsFromToken: string[] = []) => {
  if (tmsFromDB.length !== tmsFromToken.length) return false
  for (let i = 0; i < tmsFromDB.length; i++) {
    if (tmsFromDB[i] !== tmsFromToken[i]) return false
  }
  return true
}

// TODO move inside connectSocket
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

const query = `
mutation ConnectSocket {
  connectSocket {
    tms
  }
}`

const handleConnect = async (connectionContext: ConnectionContext) => {
  const {authToken, ip, id: socketId} = connectionContext

  // redis

  const redis = getRedis()
  const {sub: userId} = authToken
  await redis.rpush(
    `presence:${userId}`,
    JSON.stringify({socketId, serverId: 'server1', lastSeenAtURL: null})
  )

  // const userExists = await redis.get(`presence:${userId}`) // TODO: add interface
  // if (userExists) {
  //   const parsedUser = JSON.parse(userExists)
  //   const socketExists = parsedUser.find((userData) => userData.socketId === socketId)
  //   if (socketExists) return // throw error to sentry. socket already exists
  //   parsedUser.push({socketId, serverId: 'testing', lastSeenAtURL: null})
  //   const stringifiedUser = JSON.stringify(parsedUser)

  //   // await redis.set(`presence:${userId}`, stringifiedUser)
  // } else {
  //   const newUser = [{socketId, serverId: 'testing', lastSeenAtURL: null}]
  //   const stringifiedNewUser = JSON.stringify(newUser)
  //   await redis.set(`presence:${userId}`, stringifiedNewUser)

  //   const teamId = 'test' // TODO: get teamId
  //   await redis.set(`team:${teamId}`, userId)
  // }
  // const test = await redis.get(`presence:${userId}`)
  // console.log('handleConnect -> test', test)
  // TODO: update team and meeting subscriptions

  // redis

  const result = await publishInternalGQL({type: 'connect', authToken, ip, query, socketId})
  if (!result) return null
  const {data} = result
  const tms = data?.connectSocket?.tms
  if (!tms) return null // should NEVER happen
  const freshToken = setFreshTokenIfNeeded(connectionContext, tms)
  connectionContext.ready()
  return freshToken
}

export default handleConnect
