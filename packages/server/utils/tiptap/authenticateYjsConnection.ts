import type {onAuthenticatePayload} from '@hocuspocus/server'
import ms from 'ms'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import logError from '../logError'
import {redisStoreOrNetwork} from '../redisStoreOrNetwork'
import {getPageConnectionAccess} from './getPageConnectionAccess'
import {isYjsSessionLive} from './isYjsSessionLive'

export type YjsContext = {
  userId?: string
  iat?: number
  exp?: number
  jti?: string
  connectedAt?: number
  isUnauthenticated?: boolean
}

const rejectConnection = (message: string, reason: string) =>
  Object.assign(new Error(message), {reason})

// This is a top 15 query in terms of total time because of call frequency, so caching is necessary
const getMeetingTeamId = (meetingId: string) =>
  redisStoreOrNetwork(
    `meetingTeamId:${meetingId}`,
    async () => {
      const meeting = await getKysely()
        .selectFrom('NewMeeting')
        .select('teamId')
        .where('id', '=', meetingId)
        .executeTakeFirst()
      // throwing keeps a missing meeting out of the cache
      if (!meeting) throw rejectConnection(`Meeting not found: ${meetingId}`, 'InvalidDocument')
      return meeting.teamId
    },
    ms('3h')
  )

export const authenticateYjsConnection = async ({
  documentName,
  context,
  connectionConfig
}: Pick<onAuthenticatePayload<YjsContext>, 'documentName' | 'context' | 'connectionConfig'>) => {
  if (context.isUnauthenticated) {
    throw rejectConnection('Unauthenticated', 'Unauthenticated')
  }
  const {userId, iat, exp, jti, connectedAt} = context
  if (userId && !(await isYjsSessionLive({userId, iat: iat!, exp: exp!, jti, connectedAt}))) {
    throw rejectConnection('Unauthenticated', 'Unauthenticated')
  }
  if (documentName.startsWith('meeting:')) {
    const [, meetingId] = documentName.split(':')
    if (!meetingId || !/^meeting:[\w-]+$/.test(documentName)) {
      throw rejectConnection(`Invalid meetingId: ${meetingId}`, 'InvalidDocument')
    }
    if (!userId) {
      throw rejectConnection(`Meeting awareness requires a userId`, 'Unauthorized')
    }
    const meetingTeamId = await getMeetingTeamId(meetingId)
    const teamMember = await getKysely()
      .selectFrom('TeamMember')
      .select('id')
      .where('teamId', '=', meetingTeamId)
      .where('userId', '=', userId)
      .where('isNotRemoved', '=', true)
      .executeTakeFirst()
    if (!teamMember) {
      throw rejectConnection(
        `Meeting awareness requires being on the team: ${userId} ${meetingTeamId}`,
        'Unauthorized'
      )
    }
    // meeting docs only carry awareness
    connectionConfig.readOnly = true
    return {userId}
  }
  const [dbId] = CipherId.fromClient(documentName)
  // aliases like page:0123 would load a second copy of the page that overwrites it on store
  if (documentName !== CipherId.toClient(dbId, 'page') || dbId < 1 || dbId > 2 ** 31 - 1) {
    const error = rejectConnection(
      `Invalid document request from client: ${documentName}`,
      'InvalidDocument'
    )
    logError(error, {userId, tags: {dbId, documentName}})
    throw error
  }
  const access = await getPageConnectionAccess(dbId, userId)
  if (!access) {
    const error = rejectConnection(
      `Document does not exist or user is not authorized: ${documentName}`,
      'Unauthorized'
    )
    Logger.warn(error, {userId, extras: {dbId}})
    throw error
  }
  connectionConfig.readOnly = access.readOnly
  return {userId}
}
