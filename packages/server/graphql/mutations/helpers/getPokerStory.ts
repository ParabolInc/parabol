import {getServerIntegration} from '../../../integrations/platform/registry'
import type {DimensionFieldCtx} from '../../../integrations/platform/ServerIntegrationDefinition'

const getPokerStory = async (ctx: DimensionFieldCtx) => {
  const {integration} = ctx.task
  if (!integration) return null
  const {issueRead, estimatePush} = getServerIntegration(integration.service).capabilities
  const [issueText, fieldKey] = await Promise.all([
    issueRead.getIssueText(ctx),
    estimatePush.resolveDimensionFieldKey(ctx)
  ])
  if (!issueText || !fieldKey) return null
  return {...issueText, repoId: fieldKey.repoId}
}

export default getPokerStory
