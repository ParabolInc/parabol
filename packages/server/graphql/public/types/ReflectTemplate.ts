import ms from 'ms'
import errorFilter from '../../errorFilter'
import {ReflectTemplateResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import {DataLoaderWorker} from '../../graphql'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'

const POPULAR_RETROS = [
  'workingStuckTemplate',
  'startStopContinueTemplate',
  'whatWentWellTemplate',
  'gladSadMadTemplate',
  'original4Template',
  'fourLsTemplate'
]

const getAllRetroMeetingsForTeamIds = async (teamIds: string[], dataLoader: DataLoaderWorker) => {
  const activeMeetings = (await dataLoader.get('activeMeetingsByTeamId').loadMany(teamIds))
    .filter(errorFilter)
    .flat()
    .filter((meeting) => meeting.meetingType === 'retrospective')
  const completedMeetings = (await dataLoader.get('completedMeetingsByTeamId').loadMany(teamIds))
    .filter(errorFilter)
    .flat()
    .filter((meeting) => meeting.meetingType === 'retrospective')
  return [...activeMeetings, ...completedMeetings] as MeetingRetrospective[]
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
    const allMeetings = await getAllRetroMeetingsForTeamIds(authToken.tms, dataLoader)

    if (
      allMeetings
        .filter((meeting) => meeting.createdAt > new Date(Date.now() - ms('30d')))
        .find((meeting) => meeting.templateId === id)
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
    const allOrgMeetings = await getAllRetroMeetingsForTeamIds(orgTeamIds, dataLoader)
    if (
      allOrgMeetings
        .filter((meeting) => meeting.createdAt > new Date(Date.now() - ms('30d')))
        .filter((meeting) => !allMeetings.find((selfMeeting) => selfMeeting.id === meeting.id))
        .find((meeting) => meeting.templateId === id)
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
