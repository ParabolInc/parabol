import {getUserId} from '../../../utils/authorization'
import {createNewPage} from '../../../utils/tiptap/createNewPage'
import type {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const page = await createNewPage(
    {
      userId: viewerId,
      teamId,
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
    dataLoader,
    mutatorId
  )
  return {page}
}

export default createPage
