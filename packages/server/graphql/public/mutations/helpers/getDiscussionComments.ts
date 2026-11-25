import {PARABOL_AI_USER_ID} from '../../../../../client/utils/constants'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'

export interface DiscussionCommentLine {
  text: string
  author: string
}

export interface DiscussionComment extends DiscussionCommentLine {
  replies?: DiscussionCommentLine[]
}

export const getDiscussionComments = async (
  discussionId: string,
  dataLoader: DataLoaderInstance
): Promise<DiscussionComment[]> => {
  const rawComments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
  const shown = rawComments
    .filter(
      ({isActive, createdBy, plaintextContent}) =>
        isActive && createdBy !== PARABOL_AI_USER_ID && plaintextContent.trim()
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const shownIds = new Set(shown.map(({id}) => id))
  const toLine = async ({
    createdBy,
    isAnonymous,
    plaintextContent
  }: (typeof shown)[number]): Promise<DiscussionCommentLine> => {
    const creator = createdBy ? await dataLoader.get('users').load(createdBy) : null
    return {
      text: plaintextContent,
      author: isAnonymous || !creator ? 'Anonymous' : creator.preferredName
    }
  }
  const roots = shown.filter(({threadParentId}) => !threadParentId || !shownIds.has(threadParentId))
  return Promise.all(
    roots.map(async (root) => {
      const [line, replies] = await Promise.all([
        toLine(root),
        Promise.all(shown.filter(({threadParentId}) => threadParentId === root.id).map(toLine))
      ])
      return replies.length === 0 ? line : {...line, replies}
    })
  )
}
