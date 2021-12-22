import stringify from 'fast-json-stable-stringify'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import {JiraDimensionField} from '../postgres/queries/getTeamsByIds'
import getRethink from '../database/rethinkDriver'
import {DataLoaderWorker} from '../graphql/graphql'
import getPg from '../postgres/getPg'
import {
  IMergeTeamJiraDimensionFieldsQueryParams,
  mergeTeamJiraDimensionFieldsQuery
} from '../postgres/queries/generated/mergeTeamJiraDimensionFieldsQuery'
import catchAndLog from '../postgres/utils/catchAndLog'
import AtlassianServerManager from './AtlassianServerManager'
import {isNotNull} from './predicates'

const hashMapper = (mapper: JiraDimensionField) => {
  const {cloudId, projectKey, dimensionName} = mapper
  return JSON.stringify({cloudId, projectKey, dimensionName})
}

const ensureJiraDimensionField = async (
  requiredMappers: JiraDimensionField[],
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  if (requiredMappers.length === 0) return
  const team = await dataLoader.get('teams').load(teamId)
  const currentMappers = team.jiraDimensionFields || []
  const seenHashes = new Set<string>()
  const missingMappers = [] as JiraDimensionField[]

  currentMappers.forEach((mapper) => {
    seenHashes.add(hashMapper(mapper))
  })

  requiredMappers.forEach((requiredMapper) => {
    const hash = hashMapper(requiredMapper)
    if (seenHashes.has(hash)) return
    seenHashes.add(hash)
    missingMappers.push(requiredMapper)
  })
  if (missingMappers.length === 0) return

  const fieldNamesToTry = [
    SprintPokerDefaults.JIRA_FIELD_DEFAULT,
    SprintPokerDefaults.JIRA_FIELD_LEGACY_DEFAULT
  ]
  const auth = await dataLoader.get('freshAtlassianAuth').load({userId, teamId})
  if (!auth) return
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const newJiraDimensionFields = await Promise.all(
    missingMappers.map(async (mapper) => {
      const {cloudId, projectKey, issueKey, dimensionName} = mapper
      const defaultField = await manager.getFirstValidJiraField(cloudId, fieldNamesToTry, issueKey)
      if (!defaultField) return null
      const {id: fieldId, name: fieldName, schema} = defaultField
      const fieldType = schema.type as 'string' | 'number'
      return {
        cloudId,
        dimensionName,
        fieldId,
        fieldName,
        fieldType,
        projectKey
      } as JiraDimensionField
    })
  )
  const fieldsToAdd = newJiraDimensionFields.filter(Boolean).filter(isNotNull)
  if (fieldsToAdd.length === 0) return
  const sortedJiraDimensionFields = [...currentMappers, ...fieldsToAdd].sort((a, b) =>
    stringify(a) < stringify(b) ? -1 : 1
  )
  const r = await getRethink()
  await Promise.all([
    r
      .table('Team')
      .get(teamId)
      .update({
        jiraDimensionFields: sortedJiraDimensionFields
      })
      .run(),
    catchAndLog(() =>
      mergeTeamJiraDimensionFieldsQuery.run(
        {
          jiraDimensionFields: fieldsToAdd,
          id: teamId
        } as unknown as IMergeTeamJiraDimensionFieldsQueryParams,
        getPg()
      )
    )
  ])
}

export default ensureJiraDimensionField
