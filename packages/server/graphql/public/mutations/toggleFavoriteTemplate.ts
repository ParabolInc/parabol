import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const toggleFavoriteTemplate: MutationResolvers['toggleFavoriteTemplate'] = async (
  _source,
  {templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const userId = getUserId(authToken)

  const user = await pg
    .selectFrom('User')
    .select('favoriteTemplateIds')
    .where('id', '=', userId)
    .executeTakeFirst()

  if (!user) {
    throw new Error('User not found')
  }
  const favoriteTemplateIds = user.favoriteTemplateIds

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

  // RESOLUTION
  const data = {}
  return data
}

export default toggleFavoriteTemplate
