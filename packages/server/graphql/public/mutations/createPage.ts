import {getUserId} from '../../../utils/authorization'
import {createTopLevelPage} from '../../../utils/tiptap/createTopLevelPage'
import type {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const page = await createTopLevelPage(viewerId, dataLoader, {
    teamId,
    mutatorId
  })
  return {page}
}

export default createPage
