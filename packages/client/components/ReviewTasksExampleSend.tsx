import {Suspense} from 'react'
import {useQueryLoader} from 'react-relay'
import taskFooterIntegrateMenuQuery, {
  type TaskFooterIntegrateMenuQuery
} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import useMutationProps from '../hooks/useMutationProps'
import type {TaskClientIntegration} from '../integrations/platform/registry'
import TaskSendButton from '../modules/taskCard/components/TaskCardFooter/TaskSendButton'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import MenuSkeletonRows from '../ui/Menu/MenuSkeletonRows'
import {getConnectLabel} from '../utils/getSendServices'
import TaskFooterIntegrateMenu from './TaskFooterIntegrateMenu'

const PREVIEW_LABEL = 'This is the example card. Pick one to see what happens; nothing gets sent.'

interface Props {
  services: readonly TaskClientIntegration[]
  suggestedServices: readonly TaskClientIntegration[]
  teamId: string
  onSent: () => void
}

const ReviewTasksExampleSend = (props: Props) => {
  const {services, suggestedServices, teamId, onSent} = props
  const mutationProps = useMutationProps()
  const [queryRef, loadQuery] = useQueryLoader<TaskFooterIntegrateMenuQuery>(
    taskFooterIntegrateMenuQuery
  )
  const preload = () => {
    if (!queryRef) loadQuery({teamId}, {fetchPolicy: 'store-or-network'})
  }
  const label =
    services.length > 0 ? 'Try sending this example card' : getConnectLabel(suggestedServices)
  const skeleton = <MenuSkeletonRows count={3} />
  return (
    <Menu
      onOpenChange={(isOpen) => isOpen && preload()}
      trigger={
        <TaskSendButton
          aria-label={label}
          isCardActive
          services={services}
          suggestedServices={suggestedServices}
          onMouseEnter={preload}
          onFocus={preload}
        />
      }
    >
      <MenuContent align='end' className='max-h-96 w-[250px]'>
        <Suspense fallback={skeleton}>
          {queryRef ? (
            <TaskFooterIntegrateMenu
              listLabel={PREVIEW_LABEL}
              mutationProps={mutationProps}
              queryRef={queryRef}
              teamId={teamId}
              onPushToIntegration={onSent}
            />
          ) : (
            skeleton
          )}
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default ReviewTasksExampleSend
