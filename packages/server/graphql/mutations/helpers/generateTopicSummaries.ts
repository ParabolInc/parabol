import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const generateTopicSummaries = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const r = await getRethink()
  const manager = new OpenAIServerManager()
  for (const group of reflectionGroups) {
    const reflectionsByGroupId = reflections.filter(
      ({reflectionGroupId}) => reflectionGroupId === group.id
    )
    const reflectionTextByGroupId = reflectionsByGroupId.map((reflection) =>
      extractTextFromDraftString(reflection.content)
    )
    if (reflectionTextByGroupId.length === 0) return
    const summary = await manager.getSummary(reflectionTextByGroupId)
    await r.table('RetroReflectionGroup').get(group.id).update({summary}).run()
  }
}

export default generateTopicSummaries
