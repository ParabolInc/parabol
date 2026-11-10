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
import {getSendServices, getSendToLabel} from '../../../../utils/getSendServices'
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
    }
  }
`

interface Props {
  mutationProps: MenuMutationProps
  queryRef: PreloadedQuery<TaskSendControlQuery>
  task: TaskFooterIntegrateMenuRoot_task$key
  useTaskChild: UseTaskChild
}

const TaskSendControl = (props: Props) => {
  const {mutationProps, queryRef, task, useTaskChild} = props
  const {viewer} = usePreloadedQuery<TaskSendControlQuery>(taskSendControlQuery, queryRef)
  const services = getSendServices(viewer.teamMember?.services ?? [])
  const label = getSendToLabel(services)
  return (
    <Tooltip>
      <Menu
        trigger={
          <TooltipTrigger asChild>
            <TaskSendButton
              aria-label={label}
              services={services}
              onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
            />
          </TooltipTrigger>
        }
      >
        <MenuContent align='end' className='w-[250px]'>
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
