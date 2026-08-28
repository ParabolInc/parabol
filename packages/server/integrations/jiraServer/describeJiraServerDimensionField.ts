import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'
import JiraServerRestManager from './JiraServerRestManager'

const describeJiraServerDimensionField = async (
  {dataLoader, teamId, viewerId}: DimensionFieldCtx,
  key: DimensionFieldKey,
  fieldId: string
): Promise<DimensionFieldTarget | Error> => {
  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'jiraServer', teamId, userId: viewerId})
  if (!auth) return new Error('Not authenticated with JiraServer')
  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
  if (provider.service !== 'jiraServer') return new Error('Not authenticated with JiraServer')
  const manager = new JiraServerRestManager(auth, provider)
  const projectId = key.repoId.slice(key.repoId.indexOf(':') + 1)
  const fieldTypes = await manager.getFieldTypes(projectId, key.workItemType)
  if (fieldTypes instanceof Error) return fieldTypes
  const match = fieldTypes.find((candidate) => candidate.name === fieldId)
  if (!match) return new Error('Unknown field')
  return {fieldId: match.fieldId, fieldName: match.name, fieldType: match.schema.type}
}

export default describeJiraServerDimensionField
