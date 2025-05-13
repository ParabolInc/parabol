import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {SharingScopeEnum as ESharingScope} from '../../database/types/MeetingTemplate'
import PokerTemplate from '../../database/types/PokerTemplate'
import ReflectTemplate from '../../database/types/ReflectTemplate'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember, isUserOrgAdmin} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SharingScopeEnum, {SharingScopeEnumType} from '../types/SharingScopeEnum'
import UpdateTemplateScopePayload from '../types/UpdateTemplateScopePayload'

const updateTemplateScope = {
  type: new GraphQLNonNull(UpdateTemplateScopePayload),
  description: `Change the scope of a template`,
  args: {
    templateId: {type: new GraphQLNonNull(GraphQLID), description: 'The id of the template'},
    scope: {type: new GraphQLNonNull(SharingScopeEnum), description: 'the new scope'}
  },
  resolve: async (
    _source: unknown,
    {templateId, scope: newScope}: {templateId: string; scope: SharingScopeEnumType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const pg = getKysely()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    //AUTH
    const [template, viewer] = await Promise.all([
      dataLoader.get('meetingTemplates').load(templateId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (!template || !template.isActive) {
      return {error: {message: `Template not found`}}
    }
    const {name, teamId, orgId, scope} = template
    if (
      !isTeamMember(authToken, teamId) &&
      !(await isUserOrgAdmin(viewerId, template.orgId, dataLoader))
    ) {
      return standardError(
        new Error('You are not authorized to update the scope of this template'),
        {userId: viewerId}
      )
    }

    // VALIDATION
    if (scope === newScope) {
      return {error: {message: 'Template scope already set'}}
    }

    // RESOLUTION
    template.scope = newScope // mutate the cached record
    const SCOPES: ESharingScope[] = ['TEAM', 'ORGANIZATION', 'PUBLIC']
    const isDownscope = SCOPES.indexOf(newScope) < SCOPES.indexOf(scope)
    const usedMeeting = isDownscope
      ? await pg
          .selectFrom('NewMeeting')
          .select('id')
          .where('templateId', '=', templateId)
          .where('teamId', '!=', teamId)
          .limit(1)
          .executeTakeFirst()
      : null
    const shouldClone = !!usedMeeting
    let clonedTemplateId: string | undefined

    const cloneReflectTemplate = async () => {
      const pg = getKysely()
      const clonedTemplate = new ReflectTemplate({
        name,
        teamId,
        orgId,
        scope: newScope,
        parentTemplateId: templateId,
        lastUsedAt: template.lastUsedAt,
        illustrationUrl: template.illustrationUrl,
        mainCategory: template.mainCategory
      })
      clonedTemplateId = clonedTemplate.id
      const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
      const activePrompts = prompts.filter(({removedAt}) => !removedAt)
      const promptIds = activePrompts.map(({id}) => id)
      const clonedPrompts = activePrompts.map((prompt) => {
        return {
          id: generateUID(),
          teamId: prompt.teamId,
          templateId: clonedTemplateId!,
          parentPromptId: prompt.id,
          sortOrder: prompt.sortOrder,
          question: prompt.question,
          description: prompt.description,
          groupColor: prompt.groupColor,
          removedAt: null
        }
      })
      await pg
        .with('MeetingTemplateInsert', (qc) =>
          qc.insertInto('MeetingTemplate').values(clonedTemplate)
        )
        .with('MeetingTemplateDeactivate', (qc) =>
          qc.updateTable('MeetingTemplate').set({isActive: false}).where('id', '=', templateId)
        )
        .with('RemovePrompts', (qc) =>
          qc.updateTable('ReflectPrompt').set({removedAt: now}).where('id', 'in', promptIds)
        )
        .insertInto('ReflectPrompt')
        .values(clonedPrompts.map((p) => ({...p, sortOrder: String(p.sortOrder)})))
        .execute()
      dataLoader.clearAll(['reflectPrompts', 'meetingTemplates'])
    }

    const clonePokerTemplate = async () => {
      const clonedTemplate = new PokerTemplate({
        name,
        teamId,
        orgId,
        scope: newScope,
        parentTemplateId: templateId,
        lastUsedAt: template.lastUsedAt,
        illustrationUrl: template.illustrationUrl,
        mainCategory: template.mainCategory
      })
      clonedTemplateId = clonedTemplate.id
      const activeDimensions = await dataLoader
        .get('templateDimensionsByTemplateId')
        .load(templateId)
      const dimensionIds = activeDimensions.map(({id}) => id)
      const clonedDimensions = activeDimensions.map((dimension) => ({
        ...dimension,
        id: generateUID(),
        templateId: clonedTemplateId!
      }))

      await getKysely()
        .with('MeetingTemplateInsert', (qc) =>
          qc.insertInto('MeetingTemplate').values(clonedTemplate)
        )
        .with('MeetingTemplateDeactivate', (qc) =>
          qc.updateTable('MeetingTemplate').set({isActive: false}).where('id', '=', templateId)
        )
        .with('TemplateDimensionInsert', (qc) =>
          qc.insertInto('TemplateDimension').values(clonedDimensions)
        )
        .updateTable('TemplateDimension')
        .set({removedAt: now})
        .where('id', 'in', dimensionIds)
        .execute()
      dataLoader.clearAll(['templateDimensions', 'meetingTemplates'])
    }

    if (shouldClone) {
      if (template.type === 'retrospective') {
        cloneReflectTemplate()
      } else if (template.type === 'poker') {
        clonePokerTemplate()
      }
    } else {
      await getKysely()
        .updateTable('MeetingTemplate')
        .set({scope: newScope})
        .where('id', '=', templateId)
        .execute()
    }
    const data = {templateId, teamId, clonedTemplateId}

    analytics.templateMetrics(viewer, {...template, scope: newScope}, 'Template Shared')
    // technically, this affects every connected client (public), or every team in the org (organization), but those are edge cases
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateTemplateScopeSuccess', data, subOptions)
    return data
  }
}

export default updateTemplateScope
