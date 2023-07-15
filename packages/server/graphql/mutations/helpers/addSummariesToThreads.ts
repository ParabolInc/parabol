import {AIExplainer} from '../../../../client/types/constEnums'
import {PARABOL_AI_USER_ID} from '../../../../client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import Comment from '../../../database/types/Comment'
import DiscussStage from '../../../database/types/DiscussStage'
import {convertHtmlToTaskContent} from '../../../utils/draftjs/convertHtmlToTaskContent'
import {DataLoaderWorker} from '../../graphql'

const addSummariesToThreads = async (
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
  const {tier} = team
  const commentPromises = stages.map(async (stage, idx) => {
    const group = groups.find((group) => group.id === stage.reflectionGroupId)
    if (!group?.summary && !group?.discussionPromptQuestion) return
    const topicSummaryExplainerText =
      tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_REFLECTIONS
    const topicSummaryHtml =
      idx === 0
        ? `<html><body><i>${topicSummaryExplainerText}</i><br><p><b>🤖 Topic Summary</b></p><p>${group.summary}</p></body></html>`
        : `<html><body><p><b>🤖 Topic Summary</b></p><p>${group.summary}</p></body></html>`
    const summaryBlock = convertHtmlToTaskContent(topicSummaryHtml)
    const topicSummaryCommentInput = {
      discussionId: stage.discussionId,
      content: summaryBlock,
      threadSortOrder: 0,
      createdBy: PARABOL_AI_USER_ID
    }
    const topicSummaryComment = new Comment(topicSummaryCommentInput)

    const discussionPromptQuestionHtml =
      idx === 0
        ? `<html><body><p><b>🤖 Discussion Question</b></p><p>${group.discussionPromptQuestion}</p></body></html>`
        : `<html><body><p><b>🤖 Discussion Question</b></p><p>${group.discussionPromptQuestion}</p></body></html>`
    const discussionPromptQuestionBlock = convertHtmlToTaskContent(discussionPromptQuestionHtml)
    const discussionPromptQuestionCommentInput = {
      discussionId: stage.discussionId,
      content: discussionPromptQuestionBlock,
      threadSortOrder: 1, // make sure it's after the topic summary
      createdBy: PARABOL_AI_USER_ID
    }
    const discussionPromptQuestionComment = new Comment(discussionPromptQuestionCommentInput)

    return r({
      topicSummary: r.table('Comment').insert(topicSummaryComment),
      discussionPromptQuestion: r.table('Comment').insert(discussionPromptQuestionComment)
    }).run()
  })
  await Promise.all(commentPromises)
}

export default addSummariesToThreads
