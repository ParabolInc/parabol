import ms from 'ms'
import type {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import {attachTranscriptToSummaryPage} from './attachTranscriptToSummaryPage'
import {fetchMeetTranscript} from './fetchMeetTranscript'

// How long a call may run past the Parabol meeting before we stop waiting for its transcript
const TRANSCRIPT_DEADLINE = ms('4h')
const RETRY_INTERVAL = ms('5m')

const getConnectedUserIds = async (teamId: string, facilitatorUserId: string | null) => {
  const auths = await getKysely()
    .selectFrom('TeamMemberIntegrationAuth')
    .select('userId')
    .where('service', '=', 'gmeet')
    .where('teamId', '=', teamId)
    .where('isActive', '=', true)
    .execute()
  const userIds = auths.map(({userId}) => userId)
  // the facilitator is the likeliest host, so their conference list is the likeliest to match
  return userIds
    .filter((id) => id === facilitatorUserId)
    .concat(userIds.filter((id) => id !== facilitatorUserId))
}

export const processMeetTranscriptJob = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId, createdAt, endedAt, summaryPageId, facilitatorUserId, name} = meeting
  // without an ended meeting there is no window to match, and without a summary page nowhere to put it
  if (!endedAt || !summaryPageId) return
  if (Date.now() - endedAt.getTime() > TRANSCRIPT_DEADLINE) return

  const userIds = await getConnectedUserIds(teamId, facilitatorUserId)
  const title = `Google Meet Transcript for ${name}`
  const pg = getKysely()
  let shouldRetry = false

  for (const userId of userIds) {
    const gmeetAuth = await dataLoader.get('freshAuth').load({service: 'gmeet', teamId, userId})
    if (!gmeetAuth) continue
    const result = await fetchMeetTranscript(gmeetAuth, createdAt, endedAt, title).catch((e) => {
      Logger.log(`meet transcript fetch failed for ${meetingId} as ${userId}: ${e}`)
      return null
    })
    // Google failed to respond, try again soon
    if (!result) {
      shouldRetry = true
      continue
    }
    // the conference record exists from the moment the call starts, so a member who was on the
    // call can already see it. Not seeing one is a "never", not a "not yet"
    if (result.status === 'not-visible') continue
    // the Google Meet conference is still in progress
    if (result.status === 'pending') {
      // this member can see the conference, so no other member has a better view of it
      shouldRetry = true
      break
    }
    if (result.status === 'unavailable') continue

    const externalId = `google:${result.conferenceName}`
    // another team member's pass may have already attached this same transcript
    const insertResult = await pg
      .insertInto('ExternalMeetingFile')
      .values({id: externalId, teamId})
      .onConflict((oc) => oc.column('id').doNothing())
      .executeTakeFirst()
    if (insertResult.numInsertedOrUpdatedRows === 0n) return

    try {
      await attachTranscriptToSummaryPage(
        summaryPageId,
        [{title, content: result.content}],
        userId,
        externalId
      )
    } catch (e) {
      await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
      throw e
    }
    return
  }

  // somebody said "not yet" rather than "never", so check back
  if (shouldRetry) {
    await pg
      .insertInto('ScheduledJob')
      .values({
        type: 'MEET_TRANSCRIPT',
        runAt: new Date(Date.now() + RETRY_INTERVAL),
        meetingId
      })
      .execute()
  }
}
