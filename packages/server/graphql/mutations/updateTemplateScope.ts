import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {SharingScopeEnum as ESharingScope} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import ReflectTemplate from '../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import {isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SharingScopeEnum from '../types/SharingScopeEnum'
import UpdateTemplateScopePayload from '../types/UpdateTemplateScopePayload'

const updateTemplateScope = {
  type: GraphQLNonNull(UpdateTemplateScopePayload),
  description: `Change the scope of a template`,
  args: {
    templateId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the template'
    },
    scope: {
      type: GraphQLNonNull(SharingScopeEnum),
      description: 'the new scope'
    }
  },
  resolve: async (
    _source,
    {templateId, scope: newScope},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const template = await dataLoader.get('reflectTemplates').load(templateId)
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
    const SCOPES = [ESharingScope.TEAM, ESharingScope.ORGANIZATION, ESharingScope.PUBLIC]
    const isDownscope = SCOPES.indexOf(newScope) < SCOPES.indexOf(scope)
    const shouldClone = isDownscope
      ? await r
          .table('NewMeeting')
          .getAll(templateId, {index: 'templateId'})
          .nth(0)
          .default(null)
          .ne(null)
          .run()
      : false
    if (shouldClone) {
      const clonedTemplate = new ReflectTemplate({
        name,
        teamId,
        orgId,
        scope: newScope,
        parentTemplateId: templateId
      })
      const phaseItems = await dataLoader.get('customPhaseItemsByTeamId').load(teamId)
      const prompts = phaseItems.filter((phaseItem) => phaseItem.templateId === templateId)
      const promptIds = prompts.map(({id}) => id)
      const clonedPrompts = prompts.map((prompt) => {
        return new RetrospectivePrompt({
          ...prompt,
          parentPromptId: prompt.id
        })
      })
      await r({
        clonedTemplate: r.table('ReflectTemplate').insert(clonedTemplate),
        clonedPrompts: r.table('CustomPhaseItem').insert(clonedPrompts),
        inactivatedTemplate: r
          .table('ReflectTemplate')
          .get(templateId)
          .update({isActive: false}),
        inactivatedPrompts: r
          .table('CustomPhaseItem')
          .getAll(r.args(promptIds))
          .update({isActive: false})
      }).run()
    } else {
      await r
        .table('ReflectTemplate')
        .get(templateId)
        .update({
          scope: newScope
        })
        .run()
    }
    const data = {teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateTemplateScopeSuccess', data, subOptions)
    return data
  }
}

export default updateTemplateScope
