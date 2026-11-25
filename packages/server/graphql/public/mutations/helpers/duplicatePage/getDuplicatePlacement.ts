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

export type DuplicateDecision =
  | {kind: 'parent'; parent: ParentPage; afterPageCode: number | null}
  | {kind: 'team'; teamId: string}
  | {kind: 'private'; afterSource: boolean}

export const decideDuplicatePlacement = async ({
  viewerId,
  source,
  destination,
  dataLoader,
  resourceGrants
}: Params): Promise<DuplicateDecision> => {
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
    if (!canAddNextToSource) return {kind: 'private', afterSource: false}
    return {kind: 'parent', parent, afterPageCode: CipherId.encrypt(source.id)}
  }
  if (teamId) {
    const [teamMember, isTeamGranted] = await Promise.all([
      dataLoader.get('teamMembers').load(toTeamMemberId(teamId, viewerId)),
      !resourceGrants || resourceGrants.hasTeam(teamId)
    ])
    if (!teamMember?.isNotRemoved || !isTeamGranted) return {kind: 'private', afterSource: false}
    return {kind: 'team', teamId}
  }
  return {kind: 'private', afterSource: source.isPrivate && source.userId === viewerId}
}

export const getDuplicatePlacement = async (params: Params): Promise<DuplicatePlacement> => {
  const decision = await decideDuplicatePlacement(params)
  if (decision.kind === 'parent') return decision
  const {viewerId, source} = params
  if (decision.kind === 'team') {
    return {
      kind: 'team',
      teamId: decision.teamId,
      sortOrder: await getPageSortOrderAfter(source.sortOrder, viewerId, false, decision.teamId)
    }
  }
  return {
    kind: 'private',
    sortOrder: decision.afterSource
      ? await getPageSortOrderAfter(source.sortOrder, viewerId, true, null)
      : await getPageNextSortOrder(__START__, false, viewerId, true, null)
  }
}
