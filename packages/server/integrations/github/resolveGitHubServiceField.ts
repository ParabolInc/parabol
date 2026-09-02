import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {ServiceField, ServiceFieldCtx} from '../platform/ServerIntegrationDefinition'

const resolveGitHubServiceField = async ({
  task,
  dataLoader,
  teamId,
  dimensionName
}: ServiceFieldCtx): Promise<ServiceField | null> => {
  const {integration} = task
  if (integration?.service !== 'github') return null
  const {nameWithOwner} = integration
  const githubFieldMap = await dataLoader
    .get('githubDimensionFieldMaps')
    .load({teamId, dimensionName, nameWithOwner})
  if (githubFieldMap) {
    return {name: githubFieldMap.labelTemplate ?? '', type: 'string'}
  }
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveGitHubServiceField
