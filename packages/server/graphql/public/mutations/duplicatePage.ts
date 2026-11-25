import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'
import {duplicatePageTree} from './helpers/duplicatePage/duplicatePageTree'
import {getDuplicatePlacement} from './helpers/duplicatePage/getDuplicatePlacement'

const duplicatePage: MutationResolvers['duplicatePage'] = async (
  _source,
  {pageId, parentPageId},
  {authToken, dataLoader, socketId: mutatorId, resourceGrants}
) => {
  const viewerId = getUserId(authToken)
  const [sourcePageId] = CipherId.fromClient(pageId)
  const destinationPageId = parentPageId ? CipherId.fromClient(parentPageId)[0] : null
  const [source, destination] = await Promise.all([
    dataLoader.get('pages').load(sourcePageId),
    destinationPageId ? dataLoader.get('pages').load(destinationPageId) : null
  ])
  if (!source) throw new GraphQLError('Invalid pageId', {extensions: {code: 'BAD_USER_INPUT'}})
  if (source.isMeetingTOC) {
    throw new GraphQLError('Meeting Summaries pages cannot be duplicated', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (source.isSyncedBlock) {
    throw new GraphQLError('Synced blocks cannot be duplicated', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (source.deletedAt) {
    throw new GraphQLError('Restore this page from the Trash before copying it', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (destinationPageId) {
    if (
      !destination ||
      destination.deletedAt ||
      destination.isDatabase ||
      destination.isMeetingTOC ||
      destination.isSyncedBlock ||
      destination.id === sourcePageId ||
      destination.ancestorIds.includes(sourcePageId)
    ) {
      throw new GraphQLError("You can't copy a page there", {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  }
  const placement = await getDuplicatePlacement({
    viewerId,
    source,
    destination: destination ?? null,
    dataLoader,
    resourceGrants
  })
  if (placement.kind === 'private' && resourceGrants && !resourceGrants.isUnrestricted()) {
    throw new GraphQLError(
      "This access token is limited to specific organizations, teams or pages, so it can't make a private copy. Pass parentPageId to copy into a page it can edit",
      {extensions: {code: 'FORBIDDEN'}}
    )
  }
  const page = await duplicatePageTree({
    viewerId,
    authToken,
    dataLoader,
    resourceGrants,
    sourcePageId,
    placement,
    mutatorId
  })
  return {page}
}

export default duplicatePage
