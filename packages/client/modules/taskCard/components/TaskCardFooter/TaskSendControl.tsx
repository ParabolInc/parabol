import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {TaskFooterIntegrateMenuRoot_task$key} from '../../../../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import type {TaskSendControlQuery} from '../../../../__generated__/TaskSendControlQuery.graphql'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import {
  getConnectLabel,
  getOrgSendServices,
  getSendServices,
  getSendToLabel,
  SUGGESTED_SEND_SERVICES
} from '../../../../utils/getSendServices'
import lazyPreload from '../../../../utils/lazyPreload'
import TaskSendButton from './TaskSendButton'

const TaskFooterIntegrateMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TaskFooterIntegrateMenuRoot' */ '../../../../components/TaskFooterIntegrateMenuRoot'
    )
)

export const taskSendControlQuery = graphql`
  query TaskSendControlQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        services {
          service
          isConnected
        }
      }
      team(teamId: $teamId) {
        recentOrgTaskCounts {
          service
          taskCount
        }
      }
    }
  }
`

interface Props {
  isCardActive: boolean
  mutationProps: MenuMutationProps
  queryRef: PreloadedQuery<TaskSendControlQuery>
  task: TaskFooterIntegrateMenuRoot_task$key
  useTaskChild: UseTaskChild
}

const TaskSendControl = (props: Props) => {
  const {isCardActive, mutationProps, queryRef, task, useTaskChild} = props
  const {viewer} = usePreloadedQuery<TaskSendControlQuery>(taskSendControlQuery, queryRef)
  const services = getSendServices(viewer.teamMember?.services ?? [])
  const orgServices = getOrgSendServices(viewer.team?.recentOrgTaskCounts ?? [])
  const suggestedServices = orgServices.length > 0 ? orgServices : SUGGESTED_SEND_SERVICES
  const label = services.length > 0 ? getSendToLabel(services) : getConnectLabel(suggestedServices)
  return (
    <Tooltip>
      <Menu
        trigger={
          <TooltipTrigger asChild>
            <TaskSendButton
              aria-label={label}
              isCardActive={isCardActive}
              services={services}
              suggestedServices={suggestedServices}
              onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
            />
          </TooltipTrigger>
        }
      >
        <MenuContent align='end' className='max-h-96 w-[250px]'>
          <Suspense fallback={null}>
            <TaskFooterIntegrateMenuRoot
              mutationProps={mutationProps}
              task={task}
              useTaskChild={useTaskChild}
            />
          </Suspense>
        </MenuContent>
      </Menu>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  )
}

export default TaskSendControl
