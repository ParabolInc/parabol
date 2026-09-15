import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../integrations/platform/registry'
import ParabolLogoSVG from './ParabolLogoSVG'

interface Props {
  service: TaskServiceEnum
}

const TaskServiceIcon = (props: Props) => {
  const {service} = props
  if (!isRegisteredClientIntegration(service)) return <ParabolLogoSVG />
  const {Icon, iconClassName} = getClientIntegration(service)
  return <Icon className={iconClassName} />
}

export default TaskServiceIcon
