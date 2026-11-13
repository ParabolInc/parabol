import {Suspense} from 'react'
import type {TaskSendControlQuery} from '../__generated__/TaskSendControlQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {taskSendControlQuery} from '../modules/taskCard/components/TaskCardFooter/TaskSendControl'
import DiscussionTaskDraftSend from './DiscussionTaskDraftSend'

interface Props {
  teamId: string
}

const DiscussionTaskDraftSendRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<TaskSendControlQuery>(taskSendControlQuery, {teamId})
  const placeholder = <div className='h-6 w-6' />
  return (
    <Suspense fallback={placeholder}>
      {queryRef ? <DiscussionTaskDraftSend queryRef={queryRef} /> : placeholder}
    </Suspense>
  )
}

export default DiscussionTaskDraftSendRoot
