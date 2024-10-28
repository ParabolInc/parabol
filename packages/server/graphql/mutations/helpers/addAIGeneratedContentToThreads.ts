import {Insertable} from 'kysely'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import extractTextFromDraftString from '../../../../client/utils/draftjs/extractTextFromDraftString'
import DiscussStage from '../../../database/types/DiscussStage'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {Comment} from '../../../postgres/types/pg'
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

export const createAIComment = (discussionId: string, content: string, order: number) => ({
  id: generateUID(),
  discussionId,
  content,
  plaintextContent: extractTextFromDraftString(content),
  threadSortOrder: order,
  createdBy: PARABOL_AI_USER_ID
})

const addAIGeneratedContentToThreads = async (
  stages: DiscussStage[],
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const groups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const commentPromises = stages.map(async ({discussionId, reflectionGroupId}) => {
    const group = groups.find((group) => group.id === reflectionGroupId)
    if (!group?.discussionPromptQuestion) return
    const comments: Insertable<Comment>[] = []

    if (group.discussionPromptQuestion) {
      const topicSummaryComment = createAIComment(
        discussionId,
        buildCommentContentBlock('🤖 Discussion Question', group.discussionPromptQuestion),
        1
      )
      comments.push(topicSummaryComment)
    }
    await getKysely().insertInto('Comment').values(comments).execute()
  })
  await Promise.all(commentPromises)
}

export default addAIGeneratedContentToThreads
