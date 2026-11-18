import type {ReactNode} from 'react'
import type {DiscussionThreadables} from './DiscussionThreadList'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import DiscussionThreadRoot from './DiscussionThreadRoot'

interface Props {
  discussionId: string
  allowedThreadables: DiscussionThreadables[]
  header?: ReactNode
  emptyState?: ReactNode
  autoFocus?: boolean
  showLastTopicLine?: boolean
}

const DiscussionDrawerThread = ({
  discussionId,
  allowedThreadables,
  header,
  emptyState,
  autoFocus,
  showLastTopicLine
}: Props) => {
  const isReadOnly = allowedThreadables.length === 0
  const allowTasks = allowedThreadables.includes('task')
  return (
    <div className='relative bottom-0 flex h-full w-full max-w-[700px] flex-1 flex-col items-center justify-end overflow-auto'>
      <DiscussionThreadRoot
        discussionId={discussionId}
        allowedThreadables={allowedThreadables}
        width='100%'
        header={header}
        autoFocus={autoFocus}
        showLastTopicLine={showLastTopicLine}
        emptyState={
          emptyState ?? (
            <DiscussionThreadListEmptyState allowTasks={allowTasks} isReadOnly={isReadOnly} />
          )
        }
      />
    </div>
  )
}

export default DiscussionDrawerThread
