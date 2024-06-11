import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import Comment from '../../../database/types/Comment'
import DiscussStage from '../../../database/types/DiscussStage'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {DataLoaderWorker} from '../../graphql'

export const buildCommentContentBlock = (
  title: string,
  content: string,
  explainerText?: string
) => {
  const explainerBlock = explainerText ? `<i>${explainerText}</i><br>` : ''
  const html = `<html><body>${explainerBlock}<p><b>${title}</b></p><p>${content}</p></body></html>`
  return convertHtmlToTaskContent(html)
}

export const createAIComment = (discussionId: string, content: string, order: number) =>
  new Comment({
    discussionId,
    content,
    threadSortOrder: order,
    createdBy: PARABOL_AI_USER_ID
  })

const addAIGeneratedContentToThreads = async (
  stages: DiscussStage[],
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const [r, groups] = await Promise.all([
    getRethink(),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  const commentPromises = stages.map(async ({discussionId, reflectionGroupId}) => {
    const group = groups.find((group) => group.id === reflectionGroupId)
    if (!group?.discussionPromptQuestion) return
    const comments: Comment[] = []

    if (group.discussionPromptQuestion) {
      const topicSummaryComment = createAIComment(
        discussionId,
        buildCommentContentBlock('🤖 Discussion Question', group.discussionPromptQuestion),
        1
      )
      comments.push(topicSummaryComment)
    }

    return r.table('Comment').insert(comments).run()
  })
  await Promise.all(commentPromises)
}

export default addAIGeneratedContentToThreads
