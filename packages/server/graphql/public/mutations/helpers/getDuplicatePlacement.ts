import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {hasMinPageRole} from '../../../../../client/shared/hasMinPageRole'
import {__START__, positionAfter, positionBetween} from '../../../../../client/shared/sortOrder'
import getKysely from '../../../../postgres/getKysely'
import {CipherId} from '../../../../utils/CipherId'
import type {DataLoaderWorker} from '../../../graphql'
import type {ResourceGrants} from '../../ResourceGrants'

export type DuplicatePlacement =
  | {kind: 'parent'; parentPageId: number; afterPageCode: number | null}
  | {kind: 'team'; teamId: string; sortOrder: string}
  | {kind: 'private'; sortOrder: string}

interface Params {
  viewerId: string
  source: {
    id: number
    parentPageId: number | null
    teamId: string | null
    isPrivate: boolean
    userId: string
    sortOrder: string
  }
  destinationPageId: number | null
  dataLoader: DataLoaderWorker
  resourceGrants: ResourceGrants | null | undefined
}

const positionJustAfter = (sortOrder: string, nextSortOrder: string | undefined) =>
  nextSortOrder ? positionBetween(sortOrder, nextSortOrder) : positionAfter(sortOrder)

export const getDuplicatePlacement = async ({
  viewerId,
  source,
  destinationPageId,
  dataLoader,
  resourceGrants
}: Params): Promise<DuplicatePlacement> => {
  if (destinationPageId) {
    return {kind: 'parent', parentPageId: destinationPageId, afterPageCode: null}
  }
  const {parentPageId, teamId} = source
  const pg = getKysely()
  if (parentPageId) {
    const [parentRole, parent, isParentGranted] = await Promise.all([
      dataLoader.get('pageAccessByPageIdUserId').load({pageId: parentPageId, userId: viewerId}),
      dataLoader.get('pages').load(parentPageId),
      !resourceGrants || resourceGrants.hasPage(parentPageId)
    ])
    if (
      hasMinPageRole('editor', parentRole) &&
      isParentGranted &&
      parent &&
      !parent.deletedAt &&
      !parent.isMeetingTOC
    ) {
      return {kind: 'parent', parentPageId, afterPageCode: CipherId.encrypt(source.id)}
    }
    return {kind: 'private', sortOrder: __START__}
  }
  if (teamId) {
    const teamMember = await dataLoader.get('teamMembers').load(toTeamMemberId(teamId, viewerId))
    const isTeamGranted = !resourceGrants || (await resourceGrants.hasTeam(teamId))
    if (teamMember?.isNotRemoved && isTeamGranted) {
      const next = await pg
        .selectFrom('Page')
        .select('sortOrder')
        .where('teamId', '=', teamId)
        .where('parentPageId', 'is', null)
        .where('deletedBy', 'is', null)
        .where('sortOrder', '>', source.sortOrder)
        .orderBy('sortOrder')
        .limit(1)
        .executeTakeFirst()
      return {kind: 'team', teamId, sortOrder: positionJustAfter(source.sortOrder, next?.sortOrder)}
    }
    return {kind: 'private', sortOrder: __START__}
  }
  if (source.isPrivate && source.userId === viewerId) {
    const next = await pg
      .selectFrom('Page')
      .innerJoin('PageAccess', 'PageAccess.pageId', 'Page.id')
      .select('sortOrder')
      .where('PageAccess.userId', '=', viewerId)
      .where('isPrivate', '=', true)
      .where('parentPageId', 'is', null)
      .where('deletedBy', 'is', null)
      .where('isSyncedBlock', '=', false)
      .where('sortOrder', '>', source.sortOrder)
      .orderBy('sortOrder')
      .limit(1)
      .executeTakeFirst()
    return {kind: 'private', sortOrder: positionJustAfter(source.sortOrder, next?.sortOrder)}
  }
  return {kind: 'private', sortOrder: __START__}
}
