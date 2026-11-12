import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery, useQueryLoader} from 'react-relay'
import taskFooterIntegrateMenuQuery, {
  type TaskFooterIntegrateMenuQuery
} from '../../../../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import type {TaskFooterIntegrateMenuRoot_task$key} from '../../../../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import type {TaskSendControlQuery} from '../../../../__generated__/TaskSendControlQuery.graphql'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import MenuSkeletonRows from '../../../../ui/Menu/MenuSkeletonRows'
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
import TaskSendButton from './TaskSendButton'

type MenuRootComponent =
  typeof import('../../../../components/TaskFooterIntegrateMenuRoot')['default']

// React.lazy suspends on first render even once the chunk is downloaded, and React holds back
// content that replaces a fallback for 300ms, so the preloaded menu is rendered directly instead
let loadedMenuRoot: MenuRootComponent | null = null
const loadMenuRoot = () =>
  import(
    /* webpackChunkName: 'TaskFooterIntegrateMenuRoot' */ '../../../../components/TaskFooterIntegrateMenuRoot'
  ).then(({default: MenuRoot}) => {
    loadedMenuRoot = MenuRoot
    return MenuRoot
  })

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
  teamId: string
  useTaskChild: UseTaskChild
}

const TaskSendControl = (props: Props) => {
  const {isCardActive, mutationProps, queryRef, task, teamId, useTaskChild} = props
  const {viewer} = usePreloadedQuery<TaskSendControlQuery>(taskSendControlQuery, queryRef)
  const [menuQueryRef, loadMenuQuery] = useQueryLoader<TaskFooterIntegrateMenuQuery>(
    taskFooterIntegrateMenuQuery
  )
  const [MenuRoot, setMenuRoot] = useState<MenuRootComponent | null>(() => loadedMenuRoot)
  const preloadMenu = () => {
    if (!MenuRoot) loadMenuRoot().then((loaded) => setMenuRoot(() => loaded))
    if (!menuQueryRef) loadMenuQuery({teamId}, {fetchPolicy: 'store-or-network'})
  }
  const services = getSendServices(viewer.teamMember?.services ?? [])
  const orgServices = getOrgSendServices(viewer.team?.recentOrgTaskCounts ?? [])
  const suggestedServices = orgServices.length > 0 ? orgServices : SUGGESTED_SEND_SERVICES
  const label = services.length > 0 ? getSendToLabel(services) : getConnectLabel(suggestedServices)
  return (
    <Tooltip>
      <Menu
        onOpenChange={(isOpen) => isOpen && preloadMenu()}
        trigger={
          <TooltipTrigger asChild>
            <TaskSendButton
              aria-label={label}
              isCardActive={isCardActive}
              services={services}
              suggestedServices={suggestedServices}
              onMouseEnter={preloadMenu}
              onFocus={preloadMenu}
            />
          </TooltipTrigger>
        }
      >
        <MenuContent align='end' className='max-h-96 w-[250px]'>
          {MenuRoot ? (
            <MenuRoot
              mutationProps={mutationProps}
              queryRef={menuQueryRef}
              task={task}
              useTaskChild={useTaskChild}
            />
          ) : (
            <MenuSkeletonRows count={3} />
          )}
        </MenuContent>
      </Menu>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  )
}

export default TaskSendControl
