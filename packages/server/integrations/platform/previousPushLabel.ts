import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'

export const previousPushLabelName = (pushResult: EstimatePushResult): string | null =>
  pushResult?.targetKind === 'label' && 'labelName' in pushResult ? pushResult.labelName : null

export const previousPushLabelId = (pushResult: EstimatePushResult): string | null =>
  pushResult?.targetKind === 'label' && 'labelId' in pushResult ? pushResult.labelId : null
