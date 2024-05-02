import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const toggleFavoriteTemplate: MutationResolvers['toggleFavoriteTemplate'] = async (
  _source,
  {templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  console.log('yeppp')
  const pg = getKysely()
  const userId = getUserId(authToken)

  const user = await pg
    .selectFrom('User')
    // .selectAll()
    .select('favoriteTemplateIds')
    .where('id', '=', userId)
    .executeTakeFirst()
  console.log('🚀 ~ user:', user)

  const favs = user?.favoriteTemplateIds
  const typeFav = typeof favs
  console.log('🚀 ~ favs:', favs)
  console.log('🚀 ~ typeFav:', typeFav)

  if (!user) {
    throw new Error('User not found')
  }

  let updatedFavoriteTemplateIds

  const isCurrentlyFavorite = user.favoriteTemplateIds.includes(templateId)

  if (isCurrentlyFavorite) {
    updatedFavoriteTemplateIds = user.favoriteTemplateIds.filter((id) => id !== templateId)
  } else {
    updatedFavoriteTemplateIds = [...user.favoriteTemplateIds, templateId]
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
