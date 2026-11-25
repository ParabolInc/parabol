import {GraphQLError} from 'graphql'
import {redisHocusPocus} from '../../../hocusPocus'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {validatePageContentEdits} from '../../../utils/tiptap/applyPageContentEdits'
import {collectLinkedPageCodes} from '../../../utils/tiptap/assertReachablePageLinks'
import {parseMarkdownContent} from '../../../utils/tiptap/parsePageMarkdown'
import type {MutationResolvers} from '../resolverTypes'
import {getReachablePageCodes} from './helpers/getReachablePageCodes'

const patchPageContent: MutationResolvers['patchPageContent'] = async (
  _source,
  {pageId, edits},
  {authToken, dataLoader, resourceGrants}
) => {
  validatePageContentEdits(edits)
  const viewerId = getUserId(authToken)
  const [dbPageId] = CipherId.fromClient(pageId)
  const page = await dataLoader.get('pages').loadNonNull(dbPageId)
  if (page.isMeetingTOC) {
    throw new GraphQLError('Meeting Summaries pages cannot be edited', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const canChangePageLinks = !resourceGrants || resourceGrants.isUnrestricted()
  const reachablePageCodes = canChangePageLinks
    ? []
    : await getReachablePageCodes(
        edits.flatMap(({newText}) => collectLinkedPageCodes(parseMarkdownContent(newText))),
        resourceGrants
      )
  await redisHocusPocus.handleEvent('patchPageContent', CipherId.toClient(dbPageId, 'page'), {
    edits,
    userId: viewerId,
    resourceGrants: resourceGrants?.serialize(),
    scopes: authToken.scope,
    canChangePageLinks,
    reachablePageCodes
  })
  dataLoader.get('pages').clear(dbPageId)
  return {page: await dataLoader.get('pages').loadNonNull(dbPageId)}
}

export default patchPageContent
