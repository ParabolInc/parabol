import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {RuleContext} from '../../graphql'
import type {MutationArchivePageArgs} from '../resolverTypes'

// Whoever trashed a page may restore it even after losing access, so it never becomes unrecoverable
export const isRestoringOwnTrashedPage = rule(`isRestoringOwnTrashedPage`, {cache: 'strict'})(
  async (
    _source,
    {pageId, action}: MutationArchivePageArgs,
    {authToken, dataLoader, resourceGrants}: RuleContext
  ) => {
    if (action !== 'restore') return false
    if (resourceGrants && !resourceGrants.isUnrestricted()) return false
    const page = await dataLoader.get('pages').load(CipherId.fromClient(pageId)[0])
    return !!page?.deletedAt && page.deletedBy === getUserId(authToken)
  }
)
