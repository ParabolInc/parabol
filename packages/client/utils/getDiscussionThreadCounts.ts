import {PARABOL_AI_USER_ID} from './constants'

const COMMENTS_BEFORE_TASK_NUDGE = 3

interface ThreadItem {
  readonly __typename: string
  readonly isActive?: boolean | null
  readonly authorId?: string | null
}

interface ThreadEntry extends ThreadItem {
  readonly replies?: readonly ThreadItem[] | null
}

const getDiscussionThreadCounts = (threadables: readonly ThreadEntry[]) => {
  const shown = threadables
    .flatMap((threadable) => [threadable, ...(threadable.replies ?? [])])
    .filter((item) => item.__typename !== 'Comment' || item.isActive !== false)
  const comments = shown.filter((item) => item.__typename === 'Comment')
  const tasks = shown.filter((item) => item.__typename === 'Task').length
  const peopleComments = comments.filter((item) => item.authorId !== PARABOL_AI_USER_ID).length
  return {
    all: shown.length,
    tasks,
    comments: comments.length,
    peopleComments,
    isTaskNudge: tasks === 0 && peopleComments >= COMMENTS_BEFORE_TASK_NUDGE
  }
}

export default getDiscussionThreadCounts
