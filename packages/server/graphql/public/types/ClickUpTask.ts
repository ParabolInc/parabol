import type {ClickUpTaskSource} from '../../../integrations/clickup/mapClickUpTask'
import type {ClickUpTaskResolvers} from '../resolverTypes'

export type {ClickUpTaskSource}

const ClickUpTask: ClickUpTaskResolvers = {
  __isTypeOf: ({service}) => service === 'clickup'
}

export default ClickUpTask
