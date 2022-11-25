import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import {RValue} from 'rethinkdb-ts'
import {isNotNull} from '../../../../client/utils/predicates'
import DiscussStage from '../../../database/types/DiscussStage'
import updateStage from '../../../database/updateStage'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const generateTopicSummaries = async (
  stages: DiscussStage[],
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  const manager = new OpenAIServerManager()
  const summaryPromises = stages.map((stage) => {
    const reflectionsByGroupId = reflections.filter(
      (reflection) => reflection.reflectionGroupId === stage.reflectionGroupId
    )
    const reflectionTextByGroupId = reflectionsByGroupId.map((reflection) =>
      extractTextFromDraftString(reflection.content)
    )
    if (reflectionTextByGroupId.length === 0) return null
    return manager.getSummary(reflectionTextByGroupId)
  })
  const nonNullSummaryPromises = summaryPromises.filter(isNotNull)
  const summaries = await Promise.all(nonNullSummaryPromises)
  if (!summaries) return
  for (const [idx, stage] of stages.entries()) {
    const summary = summaries[idx]
    if (!summary) return
    const updater = (discussStage: RValue) =>
      discussStage.merge({
        topicSummary: summary
      })
    await updateStage(meetingId, stage.id, 'discuss', updater)
  }
}

export default generateTopicSummaries
