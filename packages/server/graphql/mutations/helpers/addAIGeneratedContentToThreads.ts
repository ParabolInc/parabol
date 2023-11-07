import {AIExplainer} from '../../../../client/types/constEnums'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import Comment from '../../../database/types/Comment'
import DiscussStage from '../../../database/types/DiscussStage'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {DataLoaderWorker} from '../../graphql'

const buildCommentContentBlock = (title: string, content: string, explainerText?: string) => {
  const explainerBlock = explainerText ? `<i>${explainerText}</i><br>` : ''
  const html = `<html><body>${explainerBlock}<p><b>${title}</b></p><p>${content}</p></body></html>`
  return convertHtmlToTaskContent(html)
}

const createAIComment = (discussionId: string, content: string, order: number) =>
  new Comment({
    discussionId,
    content,
    threadSortOrder: order,
    createdBy: PARABOL_AI_USER_ID
  })

const addAIGeneratedContentToThreads = async (
  stages: DiscussStage[],
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [r, groups, team] = await Promise.all([
    getRethink(),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  const {tier, trialStartDate} = team
  const commentPromises = stages.map(async ({discussionId, reflectionGroupId}, idx) => {
    const group = groups.find((group) => group.id === reflectionGroupId)
    if (!group?.summary && !group?.discussionPromptQuestion) return
    const comments: Comment[] = []

    if (group.summary) {
      const topicSummaryExplainerText =
        idx === 0
          ? tier === 'starter' && !trialStartDate
            ? AIExplainer.STARTER
            : AIExplainer.PREMIUM_REFLECTIONS
          : undefined
      const topicSummaryComment = createAIComment(
        discussionId,
        buildCommentContentBlock('🤖 Topic Summary', group.summary, topicSummaryExplainerText),
        0
      )
      comments.push(topicSummaryComment)
    }
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
