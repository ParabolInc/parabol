import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {getClientIntegration} from '../integrations/platform/registry'
import ParabolLogoSVG from './ParabolLogoSVG'

interface Props {
  service: TaskServiceEnum
}

const TaskServiceIcon = (props: Props) => {
  const {service} = props
  const definition = getClientIntegration(service)
  return definition ? <definition.Icon className={definition.iconClassName} /> : <ParabolLogoSVG />
}

export default TaskServiceIcon
