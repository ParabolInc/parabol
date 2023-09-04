import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'
import standardError from '../../../utils/standardError'

const upsertRetrospectivePrompt: MutationResolvers['upsertRetrospectivePrompt'] = async (
  _source,
  {meetingId, question},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {teamId} = meeting

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  const reflectPhase = getPhase(meeting.phases, 'reflect')

  if (!reflectPhase) {
    return standardError(new Error('Reflect phase not found'), {userId: viewerId})
  }

  const pg = getKysely()
  const res = await pg.insertInto('RetrospectivePrompt').values({
    meetingId,
    question,
    sortOrder: 0,
  })
    .returningAll()
    .executeTakeFirst()

  return {
    prompt: {
      ...res!,
      id: `MeetingRetrospectivePrompt:${meetingId}:${res!.id}`,
      teamId,
      description: '',
      templateId: null,
      removedAt: null,
    }
  }
}

export default upsertRetrospectivePrompt
