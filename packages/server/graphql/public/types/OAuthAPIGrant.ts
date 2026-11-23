import type {Oauthscopeenum} from '../../../postgres/types/pg'
import {CipherId} from '../../../utils/CipherId'
import isValid from '../../isValid'
import type {OAuthApiGrantResolvers} from '../resolverTypes'

export interface OAuthAPIGrantSource {
  id: number
  userId: string
  appName: string
  redirectUris: string[]
  scopes: Oauthscopeenum[]
  grantedOrgIds: string[] | null
  grantedTeamIds: string[] | null
  grantedPageIds: string[] | null
  createdAt: Date
  lastUsedAt: Date | null
}

// The user may have left an org or team, or lost a page, since connecting the application
const OAuthAPIGrant: OAuthApiGrantResolvers = {
  id: ({id}) => CipherId.toClient(id, 'OAuthAPIGrant'),
  grantedOrgs: async ({userId, grantedOrgIds}, _args, {dataLoader}) => {
    if (!grantedOrgIds) return null
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = grantedOrgIds.filter((orgId) =>
      organizationUsers.some((organizationUser) => organizationUser.orgId === orgId)
    )
    return (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
  },
  grantedTeams: async ({userId, grantedTeamIds}, _args, {dataLoader}) => {
    if (!grantedTeamIds) return null
    const teamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
    const teamIds = grantedTeamIds.filter((teamId) =>
      teamMembers.some((teamMember) => teamMember.teamId === teamId)
    )
    return (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  },
  grantedPages: async ({userId, grantedPageIds}, _args, {dataLoader}) => {
    if (!grantedPageIds) return null
    const pageIds = grantedPageIds.map((pageId) => CipherId.fromClient(pageId)[0])
    const accessRoles = await Promise.all(
      pageIds.map((pageId) => dataLoader.get('pageAccessByPageIdUserId').load({pageId, userId}))
    )
    const openablePageIds = pageIds.filter((_pageId, index) => accessRoles[index])
    return (await dataLoader.get('pages').loadMany(openablePageIds)).filter(isValid)
  }
}

export default OAuthAPIGrant
