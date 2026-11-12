interface ThreadItem {
  readonly __typename: string
  readonly isActive?: boolean | null
}

interface ThreadEntry extends ThreadItem {
  readonly replies?: readonly ThreadItem[] | null
}

const getDiscussionThreadCounts = (threadables: readonly ThreadEntry[]) => {
  const shown = threadables
    .flatMap((threadable) => [threadable, ...(threadable.replies ?? [])])
    .filter((item) => item.__typename !== 'Comment' || item.isActive !== false)
  return {
    all: shown.length,
    tasks: shown.filter((item) => item.__typename === 'Task').length,
    comments: shown.filter((item) => item.__typename === 'Comment').length
  }
}

export default getDiscussionThreadCounts
