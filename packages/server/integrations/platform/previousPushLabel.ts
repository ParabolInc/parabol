import type {TaskEstimate} from '../../postgres/types'

type PushColumns = Pick<TaskEstimate, 'pushService' | 'pushTargetId'>

export const previousPushLabelName = ({pushService, pushTargetId}: PushColumns) =>
  pushService === 'github' ? pushTargetId : null

export const previousPushLabelId = ({pushService, pushTargetId}: PushColumns) =>
  pushService === 'gitlab' ? pushTargetId : null
