import {GraphQLError} from 'graphql'
import {redisHocusPocus} from '../../../hocusPocus'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {Logger} from '../../../utils/Logger'
import {createNewPage} from '../../../utils/tiptap/createNewPage'
import type {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {teamId, parentPageId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  if (teamId && parentPageId) {
    throw new GraphQLError(
      "A page inside another page follows its parent's sharing, so it can't also take a teamId",
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  const parent = parentPageId
    ? await dataLoader.get('pages').load(CipherId.fromClient(parentPageId)[0])
    : null
  if (parentPageId) {
    if (!parent) {
      throw new GraphQLError('Parent page not found', {extensions: {code: 'NOT_FOUND'}})
    }
    if (parent.deletedAt) {
      throw new GraphQLError('Restore the parent page from the Trash before adding pages to it', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    if (parent.isMeetingTOC || parent.isDatabase || parent.isSyncedBlock) {
      throw new GraphQLError(
        "Pages can't be created inside Meeting Summaries, a database or a synced block",
        {extensions: {code: 'BAD_USER_INPUT'}}
      )
    }
  }
  const page = await createNewPage(
    {
      userId: viewerId,
      teamId,
      parentPageId: parent?.id,
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {level: 1},
            content: []
          }
        ]
      }
    },
    mutatorId
  )
  if (parent) {
    await redisHocusPocus
      .handleEvent('addCanonicalPageLink', CipherId.toClient(parent.id, 'page'), {
        title: '',
        pageCode: CipherId.encrypt(page.id),
        isDatabase: false,
        isSyncedBlock: false,
        append: true
      })
      .catch(Logger.error)
  }
  return {page}
}

export default createPage
