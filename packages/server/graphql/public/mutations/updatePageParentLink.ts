import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {PageId} from '../../../utils/PageId'
import type {MutationResolvers} from '../resolverTypes'

const updatePageParentLink: MutationResolvers['updatePageParentLink'] = async (
  _source,
  {pageId, isParentLinked},
  {dataLoader}
) => {
  const pg = getKysely()
  const publicId = PageId.publicIdFromClient(pageId)
  const dbPageId = await PageId.dbIdFromPublicId(publicId)
  if (!dbPageId) throw new GraphQLError('Invalid pageId')
  const page = await dataLoader.get('pages').load(dbPageId)
  dataLoader.get('pages').clearAll()
  if (!page) throw new GraphQLError('Invalid pageId')
  if (page.isMeetingTOC) throw new GraphQLError('Meeting Summaries pages cannot be modified')
  if (page.isParentLinked !== isParentLinked) {
    // PG triggers handle all the access changes
    await pg.updateTable('Page').set({isParentLinked}).where('id', '=', dbPageId).execute()
  }
  return {pageId: dbPageId}
}

export default updatePageParentLink
