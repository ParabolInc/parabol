import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {TaskSendControlQuery} from '../__generated__/TaskSendControlQuery.graphql'
import TaskSendButton from '../modules/taskCard/components/TaskCardFooter/TaskSendButton'
import {taskSendControlQuery} from '../modules/taskCard/components/TaskCardFooter/TaskSendControl'
import {
  getOrgSendServices,
  getSendServices,
  SUGGESTED_SEND_SERVICES
} from '../utils/getSendServices'

export const DRAFT_SEND_LABEL = 'Send, available once the task is created'

interface Props {
  queryRef: PreloadedQuery<TaskSendControlQuery>
}

const DiscussionTaskDraftSend = (props: Props) => {
  const {queryRef} = props
  const {viewer} = usePreloadedQuery<TaskSendControlQuery>(taskSendControlQuery, queryRef)
  const services = getSendServices(viewer.teamMember?.services ?? [])
  const orgServices = getOrgSendServices(viewer.team?.recentOrgTaskCounts ?? [])
  const suggestedServices = orgServices.length > 0 ? orgServices : SUGGESTED_SEND_SERVICES
  return (
    <TaskSendButton
      aria-label={DRAFT_SEND_LABEL}
      disabled
      isCardActive
      services={services}
      suggestedServices={suggestedServices}
    />
  )
}

export default DiscussionTaskDraftSend
