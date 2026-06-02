import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const toggleFavoriteTemplate: MutationResolvers['toggleFavoriteTemplate'] = async (
  _source,
  {templateId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  const favoriteTemplateIds = await dataLoader.get('favoriteTemplateIds').load(viewerId)
  const isCurrentlyFavorite = favoriteTemplateIds.includes(templateId)

  if (!isCurrentlyFavorite) {
    const template = await dataLoader.get('meetingTemplates').load(templateId)
    if (!template || !template.isActive) {
      throw new GraphQLError('Template not found')
    }
    const {scope} = template
    if (scope === 'TEAM') {
      if (!isTeamMember(authToken, template.teamId)) {
        throw new GraphQLError('Template is not accessible')
      }
    } else if (scope === 'ORGANIZATION') {
      const viewerTeams = await dataLoader.get('teamsByOrgIds').load(template.orgId)
      const viewerInOrg = viewerTeams.some((t) => authToken.tms.includes(t.id))
      if (!viewerInOrg) {
        throw new GraphQLError('Template is not accessible')
      }
    }
  }

  const updatedFavoriteTemplateIds = isCurrentlyFavorite
    ? favoriteTemplateIds.filter((id) => id !== templateId)
    : [...favoriteTemplateIds, templateId]

  await pg
    .updateTable('User')
    .set({favoriteTemplateIds: updatedFavoriteTemplateIds})
    .where('id', '=', viewerId)
    .execute()

  return {userId: viewerId}
}

export default toggleFavoriteTemplate
