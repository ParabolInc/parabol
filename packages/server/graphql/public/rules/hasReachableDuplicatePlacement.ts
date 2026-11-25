import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {RuleContext} from '../../graphql'
import {decideDuplicatePlacement} from '../mutations/helpers/duplicatePage/getDuplicatePlacement'
import type {MutationDuplicatePageArgs} from '../resolverTypes'

export const hasReachableDuplicatePlacement = rule('hasReachableDuplicatePlacement', {
  cache: 'strict'
})(
  async (
    _source,
    {pageId, parentPageId}: MutationDuplicatePageArgs,
    {authToken, dataLoader, resourceGrants}: RuleContext
  ) => {
    if (!resourceGrants || resourceGrants.isUnrestricted()) return true
    const [sourcePageId] = CipherId.fromClient(pageId)
    const destinationPageId = parentPageId ? CipherId.fromClient(parentPageId)[0] : null
    const [source, destination] = await Promise.all([
      dataLoader.get('pages').load(sourcePageId),
      destinationPageId ? dataLoader.get('pages').load(destinationPageId) : null
    ])
    if (!source || source.deletedAt || (destinationPageId && !destination)) return true
    const {kind} = await decideDuplicatePlacement({
      viewerId: getUserId(authToken),
      source,
      destination: destination ?? null,
      dataLoader,
      resourceGrants
    })
    if (kind === 'private') {
      return new GraphQLError(
        "This access token is limited to specific organizations, teams or pages, so it can't make a top-level private copy. Pass parentPageId to copy into a page it can edit",
        {extensions: {code: 'FORBIDDEN'}}
      )
    }
    return true
  }
)
