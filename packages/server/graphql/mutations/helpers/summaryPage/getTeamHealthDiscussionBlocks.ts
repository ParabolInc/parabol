import {PARABOL_AI_USER_ID} from '../../../../../client/utils/constants'
import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {TeamHealthMeeting} from '../../../../postgres/types/Meeting'
import getPhase from '../../../../utils/getPhase'

interface CommentLine {
  author: string
  text: string
}

interface CommentThread extends CommentLine {
  replies: CommentLine[]
}

const getCommentThreads = async (discussionId: string, dataLoader: DataLoaderInstance) => {
  const comments = await dataLoader.get('commentsByDiscussionId').load(discussionId)
  const shown = comments
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
  }: (typeof shown)[number]): Promise<CommentLine> => {
    const creator = createdBy ? await dataLoader.get('users').load(createdBy) : null
    return {
      author: isAnonymous || !creator ? 'Anonymous' : creator.preferredName,
      text: plaintextContent
    }
  }
  const roots = shown.filter(({threadParentId}) => !threadParentId || !shownIds.has(threadParentId))
  return Promise.all(
    roots.map(
      async (root): Promise<CommentThread> => ({
        ...(await toLine(root)),
        replies: await Promise.all(
          shown.filter(({threadParentId}) => threadParentId === root.id).map(toLine)
        )
      })
    )
  )
}

const makeLineParagraph = ({author, text}: CommentLine) => ({
  type: 'paragraph',
  content: [
    {type: 'text', text: `${author}: `, marks: [{type: 'bold', attrs: {}}]},
    {type: 'text', text}
  ]
})

const makeThreadItem = ({replies, ...line}: CommentThread) => ({
  type: 'listItem',
  content: [
    makeLineParagraph(line),
    ...(replies.length > 0
      ? [
          {
            type: 'bulletList',
            attrs: {tight: true},
            content: replies.map((reply) => ({
              type: 'listItem',
              content: [makeLineParagraph(reply)]
            }))
          }
        ]
      : [])
  ]
})

export const getTeamHealthDiscussionBlocks = async (
  meeting: TeamHealthMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {stages} = getPhase(meeting.phases, 'TEAM_HEALTH_RESULT')
  const discussions = await Promise.all(
    stages.map(async ({discussionId, questionId}) => {
      const [threads, question] = await Promise.all([
        getCommentThreads(discussionId, dataLoader),
        dataLoader.get('teamHealthQuestions').load(questionId)
      ])
      return {question: question?.question ?? '<Untitled>', threads}
    })
  )
  const withComments = discussions.filter(({threads}) => threads.length > 0)
  const commentCount = withComments
    .flatMap(({threads}) => threads)
    .reduce((sum, {replies}) => sum + 1 + replies.length, 0)
  if (commentCount === 0) return []
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [
        {type: 'text', text: `${commentCount} ${plural(commentCount, 'Discussion Comment')}`}
      ]
    },
    ...withComments.flatMap(({question, threads}) => [
      {
        type: 'paragraph',
        content: [{type: 'text', text: question, marks: [{type: 'bold', attrs: {}}]}]
      },
      {type: 'bulletList', attrs: {tight: true}, content: threads.map(makeThreadItem)}
    ])
  ]
}
