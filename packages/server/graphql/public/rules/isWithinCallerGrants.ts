import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {selectPersonalAccessToken} from '../../../postgres/select'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {PAT_PREFIX} from '../applyScopeDirective'
import type {
  MutationCreatePersonalAccessTokenArgs,
  MutationUpdatePersonalAccessTokenArgs
} from '../resolverTypes'

const getViewerToken = (tokenId: string, viewerId: string) =>
  selectPersonalAccessToken()
    .where('prefix', '=', tokenId.slice(PAT_PREFIX.length))
    .where('userId', '=', viewerId)
    .executeTakeFirst()

export const isWithinCallerGrants = rule(`isWithinCallerGrants`, {cache: 'strict'})(
  async (
    _source,
    args: MutationCreatePersonalAccessTokenArgs | MutationUpdatePersonalAccessTokenArgs,
    {authToken, resourceGrants}: GQLContext
  ) => {
    if (!resourceGrants) return true
    let existingToken: Awaited<ReturnType<typeof getViewerToken>>
    if ('tokenId' in args) {
      if (args.revoke) return true
      existingToken = await getViewerToken(args.tokenId, getUserId(authToken))
      if (!existingToken) return true
    }
    const {grantedOrgIds, grantedTeamIds, grantedPageIds} = args
    const isCovered = await resourceGrants.covers({
      orgIds: grantedOrgIds !== undefined ? grantedOrgIds : (existingToken?.grantedOrgIds ?? null),
      teamIds:
        grantedTeamIds !== undefined ? grantedTeamIds : (existingToken?.grantedTeamIds ?? null),
      pageIds:
        grantedPageIds !== undefined ? grantedPageIds : (existingToken?.grantedPageIds ?? null)
    })
    return (
      isCovered ||
      new GraphQLError('Cannot grant access to resources not granted to the calling token')
    )
  }
)
