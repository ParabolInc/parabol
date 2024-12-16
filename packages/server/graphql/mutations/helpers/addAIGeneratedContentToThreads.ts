import {generateText, type JSONContent} from '@tiptap/core'
import {generateJSON} from '@tiptap/html'
import {Insertable} from 'kysely'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import DiscussStage from '../../../database/types/DiscussStage'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {Comment} from '../../../postgres/types/pg'
import {DataLoaderWorker} from '../../graphql'

export const buildCommentContentBlock = (
  title: string,
  contentHTML: string,
  explainerText?: string
) => {
  const explainerBlock = explainerText ? `<i>${explainerText}</i><br>` : ''
  const html = `${explainerBlock}<p><b>${title}</b></p>${contentHTML}`
  return generateJSON(html, serverTipTapExtensions) as JSONContent
}

export const createAIComment = (discussionId: string, jsonContent: JSONContent, order: number) => ({
  id: generateUID(),
  discussionId,
  content: JSON.stringify(jsonContent),
  plaintextContent: generateText(jsonContent, serverTipTapExtensions),
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
        buildCommentContentBlock(
          '🤖 Discussion Question',
          `<p>${group.discussionPromptQuestion}</p>`
        ),
        1
      )
      comments.push(topicSummaryComment)
    }
    await getKysely().insertInto('Comment').values(comments).execute()
  })
  await Promise.all(commentPromises)
}

export default addAIGeneratedContentToThreads
