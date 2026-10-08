import type {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
import {estimatePushColumns} from '../platform/estimatePushColumns'
import {toAzureDevOpsFieldReferenceName} from './azureDevOpsEstimateFields'
import type {AzureDevOpsWorkItem} from './mapAzureDevOpsWorkItem'

/** Records as an external change any estimate that was edited in Azure DevOps after Parabol pushed it */
const refreshAzureDevOpsEstimates = async (
  dataLoader: DataLoaderWorker,
  taskId: string,
  workItem: AzureDevOpsWorkItem
) => {
  const estimates = await dataLoader.get('latestTaskEstimates').load(taskId)
  await Promise.all(
    estimates.map((estimate) => {
      const {label, discussionId, name, userId, pushService, pushTarget, pushTargetId} = estimate
      if (pushService !== 'azureDevOps' || pushTarget !== 'field' || !pushTargetId) return undefined
      const fieldValue = workItem.fields[toAzureDevOpsFieldReferenceName(pushTargetId)]
      const freshEstimate =
        fieldValue === undefined || fieldValue === null ? '' : String(fieldValue)
      if (freshEstimate === label) return undefined
      // the loader's cached row is what the rest of this request reads
      estimate.label = freshEstimate
      return getKysely()
        .insertInto('TaskEstimate')
        .values({
          changeSource: 'external',
          discussionId,
          ...estimatePushColumns({service: 'azureDevOps', target: 'field', targetId: pushTargetId}),
          label: freshEstimate,
          name,
          meetingId: null,
          stageId: null,
          taskId,
          userId
        })
        .execute()
    })
  )
}

export default refreshAzureDevOpsEstimates
