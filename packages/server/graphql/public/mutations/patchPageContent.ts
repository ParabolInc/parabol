import {GraphQLError} from 'graphql'
import {redisHocusPocus} from '../../../hocusPocus'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const MAX_EDITS = 20
const MAX_EDIT_TEXT_LENGTH = 50_000

const patchPageContent: MutationResolvers['patchPageContent'] = async (
  _source,
  {pageId, edits},
  {authToken, dataLoader, resourceGrants}
) => {
  if (edits.length === 0 || edits.length > MAX_EDITS) {
    throw new GraphQLError(`Provide between 1 and ${MAX_EDITS} edits`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (
    edits.some(
      ({oldText, newText}) =>
        oldText.length > MAX_EDIT_TEXT_LENGTH || newText.length > MAX_EDIT_TEXT_LENGTH
    )
  ) {
    throw new GraphQLError(
      `oldText and newText are limited to ${MAX_EDIT_TEXT_LENGTH} characters`,
      {
        extensions: {code: 'BAD_USER_INPUT'}
      }
    )
  }
  const viewerId = getUserId(authToken)
  const [dbPageId] = CipherId.fromClient(pageId)
  const page = await dataLoader.get('pages').loadNonNull(dbPageId)
  if (page.isMeetingTOC) {
    throw new GraphQLError('Meeting Summaries pages cannot be edited', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const error = await redisHocusPocus.handleEvent(
    'patchPageContent',
    CipherId.toClient(dbPageId, 'page'),
    {
      edits,
      userId: viewerId,
      canChangePageLinks: !resourceGrants || resourceGrants.isUnrestricted()
    }
  )
  if (error) throw new GraphQLError(error.message, {extensions: {code: error.code}})
  dataLoader.get('pages').clear(dbPageId)
  return {page: await dataLoader.get('pages').loadNonNull(dbPageId)}
}

export default patchPageContent
