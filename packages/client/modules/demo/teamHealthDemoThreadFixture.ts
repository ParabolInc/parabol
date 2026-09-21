import dayjs from 'dayjs'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import type {
  DemoComment,
  DemoDiscussion,
  DemoReactji,
  DemoReply,
  TeamHealthDemoThreadResponse
} from './teamHealthDemoFixtureTypes'
import {TeamHealthDemo} from './teamHealthDemoIds'
import {getDemoDiscussionId} from './teamHealthDemoMeetingFixture'
import {
  type DemoTeammate,
  type DemoTeammateKey,
  demoTeammateLookup,
  demoViewer
} from './teamHealthDemoTeammates'
import {type DemoTopic, demoTopics} from './teamHealthDemoTopics'

const {MEETING_ID, TEAM_ID} = TeamHealthDemo
const MINUTES_BETWEEN_COMMENTS = 7

const toUser = ({id, picture, preferredName}: DemoTeammate) => ({id, picture, preferredName})

const toContent = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const createReactjis = (
  commentId: string,
  reactjis: {emoji: string; from: DemoTeammateKey[]}[]
): DemoReactji[] =>
  reactjis.map(({emoji, from}) => ({
    id: ReactjiId.join(commentId, emoji),
    count: from.length,
    isViewerReactji: from.includes('viewer'),
    users: from.map((key) => {
      const {id, preferredName} = demoTeammateLookup[key]
      return {id, preferredName}
    })
  }))

const createDiscussion = (topic: DemoTopic): DemoDiscussion => {
  const discussionId = getDemoDiscussionId(topic)
  const startedAt = dayjs().subtract(50, 'minute')
  let commentCount = 0
  const nextTimestamp = () =>
    startedAt.add(commentCount++ * MINUTES_BETWEEN_COMMENTS, 'minute').toISOString()

  const comments = topic.thread.map((threadComment, commentIdx): DemoComment => {
    const commentId = `${discussionId}:comment${commentIdx}`
    const updatedAt = nextTimestamp()
    const replies = (threadComment.replies ?? []).map(
      (reply, replyIdx): DemoReply => ({
        __typename: 'Comment',
        __isThreadable: 'Comment',
        id: `${commentId}:reply${replyIdx}`,
        content: toContent(reply.text),
        createdByUserNullable: toUser(demoTeammateLookup[reply.author]),
        isActive: true,
        isViewerComment: false,
        reactjis: [],
        threadSortOrder: replyIdx,
        updatedAt: nextTimestamp()
      })
    )
    return {
      __typename: 'Comment',
      __isThreadable: 'Comment',
      id: commentId,
      discussionId,
      content: toContent(threadComment.text),
      createdByUserNullable: toUser(demoTeammateLookup[threadComment.author]),
      isActive: true,
      isViewerComment: false,
      reactjis: createReactjis(commentId, threadComment.reactjis ?? []),
      replies,
      threadParentId: null,
      threadSortOrder: commentIdx,
      updatedAt
    }
  })

  return {
    id: discussionId,
    discussionTopicId: `teamHealthDemoQuestion:${topic.id}`,
    meetingId: MEETING_ID,
    teamId: TEAM_ID,
    team: {id: TEAM_ID},
    commentors: [],
    thread: {
      edges: comments.map((node) => ({cursor: node.id, node})),
      pageInfo: {endCursor: comments.at(-1)?.id ?? null, hasNextPage: false}
    }
  }
}

export const createTeamHealthDemoThreadResponse = (
  discussionId: string
): TeamHealthDemoThreadResponse => {
  const topic = demoTopics.find((demoTopic) => getDemoDiscussionId(demoTopic) === discussionId)
  return {
    viewer: {
      id: demoViewer.id,
      picture: demoViewer.picture,
      highestTier: 'team',
      discussion: topic ? createDiscussion(topic) : null
    }
  }
}
