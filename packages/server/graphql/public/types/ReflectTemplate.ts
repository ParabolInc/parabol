import ms from 'ms'
import {getUserId} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {ReflectTemplateResolvers} from '../resolverTypes'

const POPULAR_RETROS = [
  'workingStuckTemplate',
  'startStopContinueTemplate',
  'whatWentWellTemplate',
  'gladSadMadTemplate',
  'original4Template',
  'fourLsTemplate'
]

const getLastUsedAtForTeams = async (
  teamIds: string[],
  templateId: string,
  dataLoader: DataLoaderWorker
) => {
  const teamMeetingTemplates = await dataLoader.get('teamMeetingTemplateByTeamId').loadMany(teamIds)
  const lastUsedAtsForTemplateId = teamMeetingTemplates
    .filter(isValid)
    .flat()
    .filter((tmt) => tmt.templateId === templateId)
    .map((row) => row.lastUsedAt.getTime())
  return Math.max(...lastUsedAtsForTemplateId)
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
    if (name.startsWith('*New Template')) {
      return []
    }

    const subCategories: string[] = []

    // Popular
    if (POPULAR_RETROS.includes(id)) {
      subCategories.push('popular')
    }

    // Others are using in your org
    const viewerId = getUserId(authToken)
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const orgIds = organizationUsers.map(({orgId}) => orgId)
    const orgTeamIds = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds))
      .filter(errorFilter)
      .flat()
      .map((team) => team.id)

    // The goal here is to issue all fetches to the DB at once, then we can parse out team membership
    const {tms} = authToken
    const [lastUsedAtOnTeam, lastUsedAtOnOrg] = await Promise.all([
      getLastUsedAtForTeams(tms, id, dataLoader),
      getLastUsedAtForTeams(
        orgTeamIds.filter((teamId) => !tms.includes(teamId)),
        id,
        dataLoader
      )
    ])

    if (lastUsedAtOnTeam > Date.now() - ms('30d')) {
      subCategories.push('recentlyUsed')
    }

    if (lastUsedAtOnOrg > Date.now() - ms('30d')) {
      subCategories.push('recentlyUsedInOrg')
    }

    // Try these activities
    if (lastUsedAtOnTeam <= 0) {
      subCategories.push('neverTried')
    }

    return subCategories
  }
}

export default ReflectTemplate
