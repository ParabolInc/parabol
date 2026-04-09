import getKysely from '../../postgres/getKysely'
import {CipherId} from '../../utils/CipherId'
import type {DataLoaderWorker} from '../graphql'

export class ResourceGrants {
  private readonly userId: string
  private readonly grantedOrgIds: string[] | null
  private readonly grantedTeamIds: string[] | null
  private readonly grantedPageIds: Set<number> | null
  private readonly dataLoader: DataLoaderWorker

  constructor(
    userId: string,
    grantedOrgIds: string[] | null,
    grantedTeamIds: string[] | null,
    grantedPageIds: string[] | null,
    dataLoader: DataLoaderWorker
  ) {
    this.userId = userId
    this.grantedOrgIds = grantedOrgIds
    this.grantedTeamIds = grantedTeamIds
    this.grantedPageIds = grantedPageIds
      ? new Set(grantedPageIds.map((id) => CipherId.fromClient(id)[0]))
      : null
    this.dataLoader = dataLoader
  }

  async hasTeam(teamId: string): Promise<boolean> {
    const teamMembers = await this.dataLoader.get('teamMembersByUserId').load(this.userId)
    const isMember = teamMembers.some((tm) => tm.teamId === teamId)
    if (!isMember) return false
    // Team directly granted (or all teams allowed)
    if (this.grantedTeamIds === null || this.grantedTeamIds.includes(teamId)) return true
    // All orgs (and thus all their teams) allowed
    if (this.grantedOrgIds === null) return true
    // Check if team's org is granted
    const team = await this.dataLoader.get('teams').load(teamId)
    if (!team) return false
    return this.grantedOrgIds.includes(team.orgId)
  }

  async hasOrg(orgId: string): Promise<boolean> {
    const orgUsers = await this.dataLoader.get('organizationUsersByUserId').load(this.userId)
    const isMember = orgUsers.some((ou) => ou.orgId === orgId)
    if (!isMember) return false
    if (this.grantedOrgIds === null) return true
    return this.grantedOrgIds.includes(orgId)
  }

  async hasPage(pageId: number): Promise<boolean> {
    // Verify user has access to this page
    const userRole = await this.dataLoader
      .get('pageAccessByPageIdUserId')
      .load({pageId, userId: this.userId})
    if (!userRole) return false

    // No grant restrictions at all
    if (
      this.grantedPageIds === null &&
      this.grantedTeamIds === null &&
      this.grantedOrgIds === null
    ) {
      return true
    }

    // Page explicitly granted
    if (this.grantedPageIds !== null && this.grantedPageIds.has(pageId)) return true

    // Fetch team and org sharing for this page
    const pg = getKysely()
    const [teamAccess, orgAccess] = await Promise.all([
      pg.selectFrom('PageTeamAccess').select('teamId').where('pageId', '=', pageId).execute(),
      pg.selectFrom('PageOrganizationAccess').select('orgId').where('pageId', '=', pageId).execute()
    ])

    // Page shared with an org — check against grantedOrgIds
    if (orgAccess.length > 0) {
      if (this.grantedOrgIds === null) return true
      if (orgAccess.some(({orgId}) => this.grantedOrgIds!.includes(orgId))) return true
    }

    // Page shared with a team — check direct team grants and team-org grants
    if (teamAccess.length > 0) {
      // If all teams or all orgs are allowed, any team share grants access
      if (this.grantedTeamIds === null || this.grantedOrgIds === null) return true
      const teamIds = teamAccess.map(({teamId}) => teamId)
      // Direct team grant
      if (teamIds.some((id) => this.grantedTeamIds!.includes(id))) return true
      // Team's org is granted
      const teams = await Promise.all(teamIds.map((id) => this.dataLoader.get('teams').load(id)))
      if (teams.some((team) => team && this.grantedOrgIds!.includes(team.orgId))) return true
    }

    return false
  }
}
