import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const updatePageParentLink: MutationResolvers['updatePageParentLink'] = async (
  _source,
  {pageId, isParentLinked},
  {dataLoader}
) => {
  const pg = getKysely()
  const [dbPageId] = CipherId.fromClient(pageId)
  const page = await dataLoader.get('pages').load(dbPageId)
  dataLoader.get('pages').clearAll()
  if (!page) throw new GraphQLError('Invalid pageId')
  if (page.isParentLinked !== isParentLinked) {
    // PG triggers handle all the access changes
    await pg.updateTable('Page').set({isParentLinked}).where('id', '=', dbPageId).execute()
  }
  return {pageId: dbPageId}
}

export default updatePageParentLink
