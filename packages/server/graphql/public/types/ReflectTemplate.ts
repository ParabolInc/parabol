import ms from 'ms'
import errorFilter from '../../errorFilter'
import {ReflectTemplateResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import {DataLoaderWorker} from '../../graphql'

const POPULAR_RETROS = [
  'workingStuckTemplate',
  'startStopContinueTemplate',
  'whatWentWellTemplate',
  'gladSadMadTemplate',
  'original4Template',
  'fourLsTemplate'
]

const getLastUsedDateForTeams = async (
  teams: string[],
  templateId: string,
  dataLoader: DataLoaderWorker
) => {
  return (await dataLoader.get('retroTemplateLastUsedByTeam').loadMany(teams))
    .filter(errorFilter)
    .map((templateLookup) => templateLookup[templateId] || new Date(0))
    .reduce((dateA, dateB) => (dateA > dateB ? dateA : dateB), new Date(0))
}

const ReflectTemplate: ReflectTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'retrospective',
  prompts: async ({id: templateId}, _args, {dataLoader}) => {
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
    return prompts
      .filter((prompt) => !prompt.removedAt)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  subCategories: async ({id, name}, _args, {dataLoader, authToken}) => {
    // :TODO: (jmtaber129): Refactor this to be a bit cleaner if decide to use subcategories
    // long-term.
    if (name === '*New Template') {
      return []
    }

    const subCategories: string[] = []

    // Popular
    if (POPULAR_RETROS.includes(id)) {
      subCategories.push('popular')
    }

    // Recently Used
    const dateLastUsedForTeam = await getLastUsedDateForTeams(authToken.tms, id, dataLoader)
    if (dateLastUsedForTeam > new Date(Date.now() - ms('30d'))) {
      subCategories.push('recentlyUsed')
    }

    // Others are using in your org
    const viewerId = getUserId(authToken)
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const orgIds = organizationUsers.map(({orgId}) => orgId)
    const orgTeamIds = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds))
      .filter(errorFilter)
      .flat()
      .map((team) => team.id)

    const dateLastUsedForOrg = await getLastUsedDateForTeams(
      orgTeamIds.filter((orgId) => !authToken.tms.includes(orgId)),
      id,
      dataLoader
    )
    if (dateLastUsedForOrg > new Date(Date.now() - ms('30d'))) {
      subCategories.push('recentlyUsedInOrg')
    }

    // Try these activities
    if (dateLastUsedForTeam.getTime() === new Date(0).getTime()) {
      subCategories.push('neverTried')
    }

    return subCategories
  }
}

export default ReflectTemplate
