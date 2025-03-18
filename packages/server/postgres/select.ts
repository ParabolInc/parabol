import type {JSONContent} from '@tiptap/core'
import {NotNull, sql, type SelectQueryBuilder} from 'kysely'
import {NewMeetingPhaseTypeEnum} from '../graphql/public/resolverTypes'
import getKysely from './getKysely'
import {JiraDimensionField, ReactjiDB, TaskTag} from './types'
import {AnyMeeting, AnyMeetingMember} from './types/Meeting'
import {AnyNotification} from './types/Notification'
import {AnyTaskIntegration} from './types/TaskIntegration'

// This type is to allow us to perform a selectAll & then overwrite any column with another type
// e.g. a column might be of type string[] but when calling to_json it will be {id: string}[]
// since string[] && {id: string}[] do not intersect, we can't do this natively within kysely with $assertType
type AssertedQuery<Q, K> =
  Q extends SelectQueryBuilder<infer T1, infer T2, infer X>
    ? SelectQueryBuilder<T1, T2, Omit<X, keyof K> & K>
    : never

export const selectTimelineEvent = () => {
  return getKysely().selectFrom('TimelineEvent').selectAll().$narrowType<
    | {
        type: 'actionComplete' | 'POKER_COMPLETE' | 'TEAM_PROMPT_COMPLETE' | 'retroComplete'
        teamId: NotNull
        orgId: NotNull
        meetingId: NotNull
      }
    | {type: 'createdTeam'; teamId: NotNull; orgId: NotNull}
  >()
}

export const selectDiscussion = () => {
  return getKysely().selectFrom('Discussion').selectAll()
}

export const selectTeamMemberIntegrationAuth = () => {
  return getKysely().selectFrom('TeamMemberIntegrationAuth').selectAll()
}
export const selectTemplateScaleRef = () => {
  return getKysely()
    .selectFrom([
      'TemplateScaleRef',
      sql<{
        name: string
        values: {color: string; label: string}[]
      }>`jsonb_to_record("TemplateScaleRef"."scale")`.as<'s'>(sql`s("name" text, "values" json)`)
    ])
    .select(['id', 'createdAt', 's.name', 's.values'])
}

export const selectTemplateScale = () => {
  return getKysely()
    .selectFrom('TemplateScale')
    .where('removedAt', 'is', null)
    .leftJoin('TemplateScaleValue', 'TemplateScale.id', 'TemplateScaleValue.templateScaleId')
    .groupBy('TemplateScale.id')
    .selectAll('TemplateScale')
    .select(() => [
      sql<
        {color: string; label: string; sortOrder: string}[]
      >`json_agg(json_build_object('color', "TemplateScaleValue".color, 'label', "TemplateScaleValue".label, 'sortOrder', "TemplateScaleValue"."sortOrder") ORDER BY "TemplateScaleValue"."sortOrder")`.as(
        'values'
      )
    ])
}

export const selectTemplateDimension = () => {
  return getKysely().selectFrom('TemplateDimension').selectAll().where('removedAt', 'is', null)
}

export const selectSuggestedAction = () => {
  return getKysely()
    .selectFrom('SuggestedAction')
    .selectAll()
    .where('removedAt', 'is', null)
    .$narrowType<
      | {type: 'createNewTeam' | 'tryTheDemo'}
      | {
          type: 'inviteYourTeam' | 'tryRetroMeeting' | 'tryActionMeeting'
          teamId: string
        }
    >()
}

// Can revert to using .selectAll() when https://github.com/kysely-org/kysely/pull/1102 is merged
export const selectTeams = () =>
  getKysely()
    .selectFrom('Team')
    .select([
      'autoJoin',
      'createdAt',
      'createdBy',
      'id',
      'isArchived',
      'isOnboardTeam',
      'isPaid',
      'kudosEmojiUnicode',
      'lastMeetingType',
      'lockMessageHTML',
      'name',
      'orgId',
      'qualAIMeetingsCount',
      'tier',
      'trialStartDate',
      'isPublic',
      'updatedAt'
    ])
    .select(({fn}) => [
      fn<JiraDimensionField[]>('to_json', ['jiraDimensionFields']).as('jiraDimensionFields')
    ])

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
    .select(({fn}) => [fn<ReactjiDB[]>('to_json', ['reactjis']).as('reactjis')])

export type CreditCard = {brand: string; expiry: string; last4: number}
export const selectOrganizations = () =>
  getKysely()
    .selectFrom('Organization')
    .select([
      'id',
      'activeDomain',
      'isActiveDomainTouched',
      'createdAt',
      'name',
      'periodEnd',
      'periodStart',
      'picture',
      'stripeId',
      'stripeSubscriptionId',
      'upcomingInvoiceEmailSentAt',
      'tier',
      'tierLimitExceededAt',
      'trialStartDate',
      'scheduledLockAt',
      'lockedAt',
      'useAI',
      'updatedAt'
    ])
    .select(({fn}) => [fn<CreditCard | null>('to_json', ['creditCard']).as('creditCard')])

export const selectTeamPromptResponses = () =>
  getKysely()
    .selectFrom('TeamPromptResponse')
    .select([
      'id',
      'createdAt',
      'updatedAt',
      'meetingId',
      'userId',
      'sortOrder',
      'content',
      'plaintextContent'
    ])
    .$narrowType<{content: JSONContent}>()
    .select(({fn}) => [fn<ReactjiDB[]>('to_json', ['reactjis']).as('reactjis')])

export type JiraSearchQuery = {
  id: string
  queryString: string
  isJQL: boolean
  projectKeyFilters?: string[]
  lastUsedAt: Date
}

export const selectMeetingSettings = () =>
  getKysely()
    .selectFrom('MeetingSettings')
    .select([
      'id',
      'meetingType',
      'teamId',
      'selectedTemplateId',
      'maxVotesPerGroup',
      'totalVotes',
      'disableAnonymity',
      'videoMeetingURL'
    ])
    .$narrowType<
      // NewMeeetingPhaseTypeEnum[] should be inferred from kysely-codegen, but it's not
      | {meetingType: 'action' | 'poker' | 'teamPrompt'}
      | {
          meetingType: 'retrospective'
          maxVotesPerGroup: NotNull
          totalVotes: NotNull
          disableAnonymity: NotNull
        }
    >()
    .select(({fn}) => [
      fn<JiraSearchQuery[]>('to_json', ['jiraSearchQueries']).as('jiraSearchQueries'),
      fn<NewMeetingPhaseTypeEnum[]>('to_json', ['phaseTypes']).as('phaseTypes')
    ])

export const selectAgendaItems = () => getKysely().selectFrom('AgendaItem').selectAll()

export const selectSlackAuths = () => getKysely().selectFrom('SlackAuth').selectAll()

export const selectSlackNotifications = () =>
  getKysely().selectFrom('SlackNotification').selectAll()

export const selectComments = () => {
  const query = getKysely()
    .selectFrom('Comment')
    .selectAll()
    .select(({fn}) => [fn<ReactjiDB[]>('to_json', ['reactjis']).as('reactjis')])
    .$narrowType<{content: JSONContent}>()
  return query as AssertedQuery<typeof query, {reactjis: ReactjiDB[]}>
}

export const selectReflectPrompts = () => getKysely().selectFrom('ReflectPrompt').selectAll()

export const selectNewMeetings = () =>
  getKysely()
    .selectFrom('NewMeeting')
    .select(({fn}) => [
      'id',
      'isLegacy',
      'createdAt',
      'updatedAt',
      'createdBy',
      'endedAt',
      'facilitatorStageId',
      'facilitatorUserId',
      'meetingCount',
      'meetingNumber',
      'name',
      'summarySentAt',
      'teamId',
      'meetingType',
      'meetingSeriesId',
      'scheduledEndTime',
      'summary',
      'sentimentScore',
      'slackTs',
      'engagement',
      'totalVotes',
      'maxVotesPerGroup',
      'disableAnonymity',
      'commentCount',
      'taskCount',
      'agendaItemCount',
      'storyCount',
      'templateId',
      'topicCount',
      'reflectionCount',
      'recallBotId',
      'videoMeetingURL',
      'templateRefId',
      'meetingPrompt',
      fn('to_json', ['phases']).as('phases'),
      fn('to_json', ['usedReactjis']).as('usedReactjis'),
      fn('to_json', ['transcription']).as('transcription'),
      fn('to_json', ['autogroupReflectionGroups']).as('autogroupReflectionGroups'),
      fn('to_json', ['resetReflectionGroups']).as('resetReflectionGroups')
    ])
    .$narrowType<AnyMeeting>()

export const selectMeetingMembers = () =>
  getKysely().selectFrom('MeetingMember').selectAll().$narrowType<AnyMeetingMember>()

export const selectMassInvitations = () => getKysely().selectFrom('MassInvitation').selectAll()

export const selectNewFeatures = () => getKysely().selectFrom('NewFeature').selectAll()

export const selectTeamInvitations = () => getKysely().selectFrom('TeamInvitation').selectAll()

export const selectTasks = () =>
  getKysely()
    .selectFrom('Task')
    .select(({fn}) => [
      'id',
      'createdAt',
      'createdBy',
      'doneMeetingId',
      'dueDate',
      'integrationHash',
      'meetingId',
      'plaintextContent',
      'sortOrder',
      'status',
      'teamId',
      'discussionId',
      'threadParentId',
      'threadSortOrder',
      'updatedAt',
      'userId',
      // this is to match the previous behavior, no reason we couldn't export as json in the future
      sql<string>`content::text`.as('content'),
      fn<TaskTag[]>('to_json', ['tags']).as('tags'),
      fn<AnyTaskIntegration | null>('to_json', ['integration']).as('integration')
    ])

export const selectNotifications = () =>
  getKysely().selectFrom('Notification').selectAll().$narrowType<AnyNotification>()
