import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import Comment from '../../../database/types/Comment'
import DiscussStage from '../../../database/types/DiscussStage'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {DataLoaderWorker} from '../../graphql'

const addSummariesToThreads = async (
  stages: DiscussStage[],
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const [r, groups] = await Promise.all([
    getRethink(),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  const commentPromises = stages.map(async (stage) => {
    const group = groups.find((group) => group.id === stage.reflectionGroupId)
    if (!group || !group.summary) return
    const html = `<html><body><i>AI-generated summaries are a premium feature. We'll share these with you in your first few retros so you can see what they're like.</i><br><p><b>Topic Summary:</b></p><p>${group.summary}</p></body></html>`
    const summaryBlock = convertHtmlToTaskContent(html)
    const commentInput = {
      discussionId: stage.discussionId,
      content: summaryBlock,
      threadSortOrder: 0,
      isAI: true,
      createdBy: PARABOL_AI_USER_ID
    }
    const dbComment = new Comment(commentInput)
    return r.table('Comment').insert(dbComment).run()
  })
  await Promise.all(commentPromises)
}

export default addSummariesToThreads
