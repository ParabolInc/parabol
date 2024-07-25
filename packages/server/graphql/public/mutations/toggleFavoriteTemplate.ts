import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const toggleFavoriteTemplate: MutationResolvers['toggleFavoriteTemplate'] = async (
  _source,
  {templateId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const userId = getUserId(authToken)

  const favoriteTemplateIds = await dataLoader.get('favoriteTemplateIds').load(viewerId)

  let updatedFavoriteTemplateIds

  const isCurrentlyFavorite = favoriteTemplateIds.includes(templateId)

  if (isCurrentlyFavorite) {
    updatedFavoriteTemplateIds = favoriteTemplateIds.filter((id) => id !== templateId)
  } else {
    updatedFavoriteTemplateIds = [...favoriteTemplateIds, templateId]
  }

  await pg
    .updateTable('User')
    .set({
      favoriteTemplateIds: updatedFavoriteTemplateIds
    })
    .where('id', '=', userId)
    .execute()

  return true
}

export default toggleFavoriteTemplate
