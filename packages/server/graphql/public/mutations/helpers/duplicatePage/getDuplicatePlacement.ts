import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {hasMinPageRole} from '../../../../../../client/shared/hasMinPageRole'
import {__START__} from '../../../../../../client/shared/sortOrder'
import type {Page} from '../../../../../postgres/types'
import {CipherId} from '../../../../../utils/CipherId'
import type {DataLoaderWorker} from '../../../../graphql'
import type {ResourceGrants} from '../../../ResourceGrants'
import {getPageNextSortOrder, getPageSortOrderAfter} from '../getPageNextSortOrder'

export type ParentPage = Pick<Page, 'id' | 'ancestorIds' | 'isPrivate'>

export type DuplicatePlacement =
  | {kind: 'parent'; parent: ParentPage; afterPageCode: number | null}
  | {kind: 'team'; teamId: string; sortOrder: string}
  | {kind: 'private'; sortOrder: string}

interface Params {
  viewerId: string
  source: Pick<Page, 'id' | 'parentPageId' | 'teamId' | 'isPrivate' | 'userId' | 'sortOrder'>
  destination: ParentPage | null
  dataLoader: DataLoaderWorker
  resourceGrants: ResourceGrants | null | undefined
}

const getTopOfPrivate = async (viewerId: string): Promise<DuplicatePlacement> => ({
  kind: 'private',
  sortOrder: await getPageNextSortOrder(__START__, false, viewerId, true, null)
})

export const getDuplicatePlacement = async ({
  viewerId,
  source,
  destination,
  dataLoader,
  resourceGrants
}: Params): Promise<DuplicatePlacement> => {
  if (destination) return {kind: 'parent', parent: destination, afterPageCode: null}
  const {parentPageId, teamId} = source
  if (parentPageId) {
    const [parentRole, parent, isParentGranted] = await Promise.all([
      dataLoader.get('pageAccessByPageIdUserId').load({pageId: parentPageId, userId: viewerId}),
      dataLoader.get('pages').load(parentPageId),
      !resourceGrants || resourceGrants.hasPage(parentPageId)
    ])
    const canAddNextToSource =
      hasMinPageRole('editor', parentRole) &&
      isParentGranted &&
      parent &&
      !parent.deletedAt &&
      !parent.isMeetingTOC
    if (!canAddNextToSource) return getTopOfPrivate(viewerId)
    return {kind: 'parent', parent, afterPageCode: CipherId.encrypt(source.id)}
  }
  if (teamId) {
    const [teamMember, isTeamGranted] = await Promise.all([
      dataLoader.get('teamMembers').load(toTeamMemberId(teamId, viewerId)),
      !resourceGrants || resourceGrants.hasTeam(teamId)
    ])
    if (!teamMember?.isNotRemoved || !isTeamGranted) return getTopOfPrivate(viewerId)
    const sortOrder = await getPageSortOrderAfter(source.sortOrder, viewerId, false, teamId)
    return {kind: 'team', teamId, sortOrder}
  }
  if (source.isPrivate && source.userId === viewerId) {
    const sortOrder = await getPageSortOrderAfter(source.sortOrder, viewerId, true, null)
    return {kind: 'private', sortOrder}
  }
  return getTopOfPrivate(viewerId)
}
