import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'

export const previousPushLabelName = (pushResult: EstimatePushResult): string | null =>
  pushResult?.service === 'github' ? pushResult.labelName : null

export const previousPushLabelId = (pushResult: EstimatePushResult): string | null =>
  pushResult?.service === 'gitlab' ? pushResult.labelId : null
