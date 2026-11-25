import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {TeamHealthMeeting} from '../../../../postgres/types/Meeting'
import getPhase from '../../../../utils/getPhase'
import {
  type DiscussionComment,
  type DiscussionCommentLine,
  getDiscussionComments
} from '../../../public/mutations/helpers/getDiscussionComments'

const makeLineParagraph = ({author, text}: DiscussionCommentLine) => ({
  type: 'paragraph',
  content: [
    {type: 'text', text: `${author}: `, marks: [{type: 'bold', attrs: {}}]},
    {type: 'text', text}
  ]
})

const makeCommentItem = ({replies = [], ...line}: DiscussionComment) => ({
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
  const orderedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder)
  const discussions = await Promise.all(
    orderedStages.map(async ({discussionId, questionId}) => {
      const [comments, question] = await Promise.all([
        getDiscussionComments(discussionId, dataLoader),
        dataLoader.get('teamHealthQuestions').load(questionId)
      ])
      return {question: question?.question ?? '<Untitled>', comments}
    })
  )
  const withComments = discussions.filter(({comments}) => comments.length > 0)
  const commentCount = withComments
    .flatMap(({comments}) => comments)
    .reduce((sum, {replies = []}) => sum + 1 + replies.length, 0)
  if (commentCount === 0) return []
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [
        {type: 'text', text: `${commentCount} ${plural(commentCount, 'Discussion Comment')}`}
      ]
    },
    ...withComments.flatMap(({question, comments}) => [
      {
        type: 'paragraph',
        content: [{type: 'text', text: question, marks: [{type: 'bold', attrs: {}}]}]
      },
      {type: 'bulletList', attrs: {tight: true}, content: comments.map(makeCommentItem)}
    ])
  ]
}
