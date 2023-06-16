import ms from 'ms'
import errorFilter from '../../errorFilter'
import {ReflectTemplateResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'

const POPULAR_RETROS = [
  'workingStuckTemplate',
  'startStopContinueTemplate',
  'whatWentWellTemplate',
  'gladSadMadTemplate',
  'original4Template',
  'fourLsTemplate'
]

const getAllMeetingsForTeamIds = async (teamIds: string[], dataLoader) => {
  const activeMeetings = (await dataLoader.get('activeMeetingsByTeamId').loadMany(teamIds))
    .filter(errorFilter)
    .flat()
  const completedMeetings = (await dataLoader.get('completedMeetingsByTeamId').loadMany(teamIds))
    .filter(errorFilter)
    .flat()
  return [...activeMeetings, ...completedMeetings]
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
  subCategories: async ({id}, _args, {dataLoader, authToken}) => {
    const subCategories: string[] = []
    // Popular
    if (POPULAR_RETROS.includes(id)) {
      subCategories.push('popular')
    }

    // Recently Used
    const allMeetings = await getAllMeetingsForTeamIds(authToken.tms, dataLoader)

    if (
      allMeetings
        .filter((meeting) => meeting.createdAt > new Date(Date.now() - ms('30d')))
        .find((meeting) => meeting.meetingType === 'retrospective' && meeting.templateId === id)
    ) {
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
    const allOrgMeetings = await getAllMeetingsForTeamIds(orgTeamIds, dataLoader)
    if (
      allOrgMeetings
        .filter((meeting) => meeting.createdAt > new Date(Date.now() - ms('30d')))
        .find((meeting) => meeting.meetingType === 'retrospective' && meeting.templateId === id)
    ) {
      subCategories.push('recentlyUsedInOrg')
    }

    // Try these activities
    if (!allMeetings.find((meeting) => meeting.templateId === id)) {
      subCategories.push('neverTried')
    }

    return subCategories
  }
}

export default ReflectTemplate
