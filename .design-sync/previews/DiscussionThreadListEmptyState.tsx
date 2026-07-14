import {DiscussionThreadListEmptyState} from 'parabol-client'

export const WithTasks = () => <DiscussionThreadListEmptyState allowTasks />

export const CommentsOnly = () => <DiscussionThreadListEmptyState allowTasks={false} />

export const ReadOnly = () => <DiscussionThreadListEmptyState allowTasks isReadOnly />
