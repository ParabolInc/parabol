import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import {SharingScopeEnum as ESharingScope} from '../../database/types/MeetingTemplate'
import PokerTemplate from '../../database/types/PokerTemplate'
import ReflectTemplate from '../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import TemplateDimension from '../../database/types/TemplateDimension'
import insertMeetingTemplate from '../../postgres/queries/insertMeetingTemplate'
import removeMeetingTemplate from '../../postgres/queries/removeMeetingTemplate'
import updateMeetingTemplateScope from '../../postgres/queries/updateMeetingTemplateScope'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SharingScopeEnum, {SharingScopeEnumType} from '../types/SharingScopeEnum'
import UpdateTemplateScopePayload from '../types/UpdateTemplateScopePayload'
import sendTemplateEventToSegment from './helpers/sendTemplateEventToSegment'

const updateTemplateScope = {
  type: new GraphQLNonNull(UpdateTemplateScopePayload),
  description: `Change the scope of a template`,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the template'
    },
    scope: {
      type: new GraphQLNonNull(SharingScopeEnum),
      description: 'the new scope'
    }
  },
  resolve: async (
    _source: unknown,
    {templateId, scope: newScope}: {templateId: string; scope: SharingScopeEnumType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    //AUTH
    const template = await dataLoader.get('meetingTemplates').load(templateId)
    if (!template || !template.isActive) {
      return {error: {message: `Template not found`}}
    }
    const {name, teamId, orgId, scope} = template
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not a member of the team`}}
    }

    // VALIDATION
    if (scope === newScope) {
      return {error: {message: 'Template scope already set'}}
    }

    // RESOLUTION
    template.scope = newScope // mutate the cached record
    const SCOPES: ESharingScope[] = ['TEAM', 'ORGANIZATION', 'PUBLIC']
    const isDownscope = SCOPES.indexOf(newScope) < SCOPES.indexOf(scope)
    const shouldClone = isDownscope
      ? await r
          .table('NewMeeting')
          .getAll(templateId, {index: 'templateId'})
          .filter((meeting: RDatum) => meeting('teamId').ne(teamId))
          .nth(0)
          .default(null)
          .ne(null)
          .run()
      : false
    let clonedTemplateId: string | undefined

    const cloneReflectTemplate = async () => {
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
        return new RetrospectivePrompt({
          ...prompt,
          templateId: clonedTemplateId!,
          parentPromptId: prompt.id,
          removedAt: null
        })
      })
      await Promise.all([
        insertMeetingTemplate(clonedTemplate),
        removeMeetingTemplate(templateId),
        r.table('ReflectPrompt').insert(clonedPrompts).run(),
        r.table('ReflectPrompt').getAll(r.args(promptIds)).update({removedAt: now}).run()
      ])
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
      const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
      const activeDimensions = dimensions.filter(({removedAt}) => !removedAt)
      const dimensionIds = activeDimensions.map(({id}) => id)
      const clonedDimensions = activeDimensions.map((dimension) => {
        return new TemplateDimension({
          ...dimension,
          templateId: clonedTemplateId!
        })
      })

      await Promise.all([
        insertMeetingTemplate(clonedTemplate),
        removeMeetingTemplate(templateId),
        r.table('TemplateDimension').insert(clonedDimensions).run(),
        r.table('TemplateDimension').getAll(r.args(dimensionIds)).update({removedAt: now}).run()
      ])
    }

    if (shouldClone) {
      if (template.type === 'retrospective') {
        cloneReflectTemplate()
      } else if (template.type === 'poker') {
        clonePokerTemplate()
      }
    } else {
      await updateMeetingTemplateScope(templateId, newScope)
    }
    const data = {templateId, teamId, clonedTemplateId}

    sendTemplateEventToSegment(viewerId, {...template, scope: newScope}, 'Template Shared')
    // technically, this affects every connected client (public), or every team in the org (organization), but those are edge cases
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateTemplateScopeSuccess', data, subOptions)
    return data
  }
}

export default updateTemplateScope
