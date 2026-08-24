import ms from 'ms'
import getKysely from '../../postgres/getKysely'

// Meet needs a moment to close out the conference record after the last participant leaves
const FIRST_CHECK_DELAY = ms('2m')

export const scheduleMeetTranscriptJob = async (meetingId: string, teamId: string) => {
  const pg = getKysely()
  const isConnected = await pg
    .selectFrom('TeamMemberIntegrationAuth')
    .select('userId')
    .where('service', '=', 'gmeet')
    .where('teamId', '=', teamId)
    .where('isActive', '=', true)
    .limit(1)
    .executeTakeFirst()
  if (!isConnected) return
  await pg
    .insertInto('ScheduledJob')
    .values({
      type: 'MEET_TRANSCRIPT',
      runAt: new Date(Date.now() + FIRST_CHECK_DELAY),
      meetingId
    })
    .execute()
}
