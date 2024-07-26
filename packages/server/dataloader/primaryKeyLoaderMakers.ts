import getKysely from '../postgres/getKysely'
import {getDiscussionsByIds} from '../postgres/queries/getDiscussionsByIds'
import {getDomainJoinRequestsByIds} from '../postgres/queries/getDomainJoinRequestsByIds'
import getMeetingSeriesByIds from '../postgres/queries/getMeetingSeriesByIds'
import getMeetingTemplatesByIds from '../postgres/queries/getMeetingTemplatesByIds'
import {getTeamPromptResponsesByIds} from '../postgres/queries/getTeamPromptResponsesByIds'
import getTemplateRefsByIds from '../postgres/queries/getTemplateRefsByIds'
import getTemplateScaleRefsByIds from '../postgres/queries/getTemplateScaleRefsByIds'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import {
  selectSuggestedAction,
  selectTemplateDimension,
  selectTemplateScale
} from '../postgres/select'
import {primaryKeyLoaderMaker} from './primaryKeyLoaderMaker'

export const users = primaryKeyLoaderMaker(getUsersByIds)

export const selectTeams = () =>
  getKysely()
    .selectFrom('Team')
    .select([
      'autoJoin',
      'createdAt',
      'createdBy',
      'id',
      'insightsUpdatedAt',
      'isArchived',
      'isOnboardTeam',
      'isPaid',
      'kudosEmojiUnicode',
      'lastMeetingType',
      'lockMessageHTML',
      'meetingEngagement',
      'mostUsedEmojis',
      'name',
      'orgId',
      'qualAIMeetingsCount',
      'tier',
      'topRetroTemplates',
      'trialStartDate',
      'updatedAt'
    ])
    .select(({fn}) => [
      fn<
        {
          dimensionName: string
          cloudId: string
          projectKey: string
          issueKey: string
          fieldName: string
          fieldType: string
          fieldId: string
        }[]
      >('to_json', ['jiraDimensionFields']).as('jiraDimensionFields')
    ])
export const teams = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTeams().where('id', 'in', ids).execute()
})
export const discussions = primaryKeyLoaderMaker(getDiscussionsByIds)
export const templateRefs = primaryKeyLoaderMaker(getTemplateRefsByIds)
export const templateScaleRefs = primaryKeyLoaderMaker(getTemplateScaleRefsByIds)
export const teamPromptResponses = primaryKeyLoaderMaker(getTeamPromptResponsesByIds)
export const meetingSeries = primaryKeyLoaderMaker(getMeetingSeriesByIds)
export const meetingTemplates = primaryKeyLoaderMaker(getMeetingTemplatesByIds)
export const domainJoinRequests = primaryKeyLoaderMaker(getDomainJoinRequestsByIds)

export const embeddingsMetadata = primaryKeyLoaderMaker((ids: readonly number[]) => {
  return getKysely().selectFrom('EmbeddingsMetadata').selectAll().where('id', 'in', ids).execute()
})

export const retroReflectionGroups = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('RetroReflectionGroup').selectAll().where('id', 'in', ids).execute()
})

export const selectRetroReflections = () =>
  getKysely()
    .selectFrom('RetroReflection')
    .select([
      'id',
      'content',
      'createdAt',
      'creatorId',
      'isActive',
      'meetingId',
      'plaintextContent',
      'promptId',
      'reflectionGroupId',
      'sentimentScore',
      'sortOrder',
      'updatedAt'
    ])
    .select(({fn}) => [
      fn<{lemma: string; salience: number; name: string}[]>('to_json', ['entities']).as('entities'),
      fn<{id: string; userId: string}[]>('to_json', ['reactjis']).as('reactjis')
    ])

export const retroReflections = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectRetroReflections().where('id', 'in', ids).execute()
})

export const timelineEvents = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('TimelineEvent').selectAll().where('id', 'in', ids).execute()
})

export const selectOrganizations = () =>
  getKysely()
    .selectFrom('Organization')
    .select([
      'id',
      'activeDomain',
      'isActiveDomainTouched',
      'createdAt',
      'name',
      'payLaterClickCount',
      'periodEnd',
      'periodStart',
      'picture',
      'showConversionModal',
      'stripeId',
      'stripeSubscriptionId',
      'upcomingInvoiceEmailSentAt',
      'tier',
      'tierLimitExceededAt',
      'trialStartDate',
      'scheduledLockAt',
      'lockedAt',
      'updatedAt',
      'featureFlags'
    ])
    .select(({fn}) => [
      fn<{brand: string; expiry: string; last4: number} | null>('to_json', ['creditCard']).as(
        'creditCard'
      )
    ])
export const organizations = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectOrganizations().where('id', 'in', ids).execute()
})

export const saml = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely()
    .selectFrom('SAMLDomain')
    .innerJoin('SAML', 'SAML.id', 'SAMLDomain.samlId')
    .where('SAML.id', 'in', ids)
    .groupBy('SAML.id')
    .selectAll('SAML')
    .select(({fn}) => [fn.agg<string[]>('array_agg', ['SAMLDomain.domain']).as('domains')])
    .execute()
})

export const organizationUsers = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('OrganizationUser').selectAll().where('id', 'in', ids).execute()
})

export const teamMembers = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('TeamMember').selectAll().where('id', 'in', ids).execute()
})

export const templateScales = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTemplateScale().where('TemplateScale.id', 'in', ids).execute()
})

export const templateDimensions = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTemplateDimension().where('id', 'in', ids).execute()
})

export const suggestedActions = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectSuggestedAction().where('id', 'in', ids).execute()
})
