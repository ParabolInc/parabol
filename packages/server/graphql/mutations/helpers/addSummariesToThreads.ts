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
    if (!group?.summary) return
    const explainerText = tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_REFLECTIONS
    const html =
      idx === 0
        ? `<html><body><i>${explainerText}</i><br><p><b>🤖 Topic Summary</b></p><p>${group.summary}</p></body></html>`
        : `<html><body><p><b>🤖 Topic Summary</b></p><p>${group.summary}</p></body></html>`
    const summaryBlock = convertHtmlToTaskContent(html)
    const commentInput = {
      discussionId: stage.discussionId,
      content: summaryBlock,
      threadSortOrder: 0,
      createdBy: PARABOL_AI_USER_ID
    }
    const dbComment = new Comment(commentInput)
    return r.table('Comment').insert(dbComment).run()
  })
  await Promise.all(commentPromises)
}

export default addSummariesToThreads
