import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import convertToTaskContent from '../../../../client/utils/draftjs/convertToTaskContent'
import getRethink from '../../../database/rethinkDriver'
import Comment from '../../../database/types/Comment'
import DiscussStage from '../../../database/types/DiscussStage'
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
    const summaryBlock = convertToTaskContent(group.summary)
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
