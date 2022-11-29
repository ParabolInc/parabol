import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const generateGroupSummaries = async (
  meetingId: string,
  dataLoader: DataLoaderWorker,
  facilitatorUserId: string
) => {
  const [reflections, reflectionGroups, facilitator] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('users').loadNonNull(facilitatorUserId)
  ])
  if (!facilitator.featureFlags.includes('aiSummary')) return
  const r = await getRethink()
  const manager = new OpenAIServerManager()
  for (const group of reflectionGroups) {
    const reflectionsByGroupId = reflections.filter(
      ({reflectionGroupId}) => reflectionGroupId === group.id
    )
    if (reflectionsByGroupId.length <= 1) continue
    const reflectionTextByGroupId = reflectionsByGroupId.map((reflection) =>
      extractTextFromDraftString(reflection.content)
    )
    if (reflectionTextByGroupId.length === 0) continue
    const summary = await manager.getSummary(reflectionTextByGroupId)
    if (!summary) continue
    r.table('RetroReflectionGroup').get(group.id).update({summary}).run()
  }
}

export default generateGroupSummaries
