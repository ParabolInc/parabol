import stringify from 'fast-json-stable-stringify'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import getRethink from '../database/rethinkDriver'
import JiraDimensionField from '../database/types/JiraDimensionField'
import {DataLoaderWorker} from '../graphql/graphql'
import getPg from '../postgres/getPg'
import {
  IMergeTeamJiraDimensionFieldsQueryParams,
  mergeTeamJiraDimensionFieldsQuery
} from '../postgres/queries/generated/mergeTeamJiraDimensionFieldsQuery'
import catchAndLog from '../postgres/utils/catchAndLog'
import AtlassianServerManager from './AtlassianServerManager'

interface Mapper {
  cloudId: string
  projectKey: string
  issueKey: string
  dimensionName: string
}

const hashMapper = (mapper: Mapper) => {
  const {cloudId, projectKey, dimensionName} = mapper
  return JSON.stringify({cloudId, projectKey, dimensionName})
}

const ensureJiraDimensionField = async (
  requiredMappers: Mapper[],
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  if (requiredMappers.length === 0) return
  const team = await dataLoader.get('teams').load(teamId)
  const currentMappers = team.jiraDimensionFields || []
  const seenHashes = new Set<string>()
  const missingMappers = [] as Mapper[]

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
      return new JiraDimensionField({
        cloudId,
        dimensionName,
        fieldId,
        fieldName,
        fieldType,
        projectKey
      })
    })
  )
  const fieldsToAdd = newJiraDimensionFields.filter(Boolean)
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
        ({
          jiraDimensionFields: fieldsToAdd,
          id: teamId
        } as unknown) as IMergeTeamJiraDimensionFieldsQueryParams,
        getPg()
      )
    )
  ])
}

export default ensureJiraDimensionField
