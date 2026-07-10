import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import getKysely from '../../../../postgres/getKysely'

export const getComments = async (reflectionGroupId: string, dataLoader: DataLoaderInstance) => {
  const pg = getKysely()
  const IGNORE_COMMENT_USER_IDS = ['parabolAIUser']
  const discussion = await pg
    .selectFrom('Discussion')
    .selectAll()
    .where('discussionTopicId', '=', reflectionGroupId)
    .limit(1)
    .executeTakeFirst()
  if (!discussion) return []
  const {id: discussionId} = discussion
  const rawComments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
  const humanComments = rawComments.filter((c) => !IGNORE_COMMENT_USER_IDS.includes(c.createdBy!))
  const rootComments = humanComments.filter((c) => !c.threadParentId)
  rootComments.sort((a, b) => {
    return a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1
  })
  const comments = await Promise.all(
    rootComments.map(async (comment) => {
      const {createdBy, isAnonymous, plaintextContent} = comment
      const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
      const commentAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
      const commentReplies = await Promise.all(
        humanComments
          .filter((c) => c.threadParentId === comment.id)
          .sort((a, b) => {
            return a.createdAt.getTime() < b.createdAt.getTime() ? -1 : 1
          })
          .map(async (reply) => {
            const {createdBy, isAnonymous, plaintextContent} = reply
            const creator = createdBy ? await dataLoader.get('users').loadNonNull(createdBy) : null
            const replyAuthor = isAnonymous || !creator ? 'Anonymous' : creator.preferredName
            return {
              text: plaintextContent,
              author: replyAuthor
            }
          })
      )
      return commentReplies.length === 0
        ? {
            text: plaintextContent,
            author: commentAuthor
          }
        : {
            text: plaintextContent,
            author: commentAuthor,
            replies: commentReplies
          }
    })
  )
  return comments
}
