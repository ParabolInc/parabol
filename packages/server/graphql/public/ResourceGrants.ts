import {type Expression, expressionBuilder, type SqlBool} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {DB} from '../../postgres/types/pg'
import {CipherId} from '../../utils/CipherId'
import type {DataLoaderWorker} from '../graphql'

const eb = expressionBuilder<DB>()

export interface SerializedResourceGrants {
  grantedOrgIds: string[] | null
  grantedTeamIds: string[] | null
  grantedPageIds: string[] | null
}

export class ResourceGrants {
  private readonly userId: string
  private readonly grantedOrgIds: string[] | null
  private readonly grantedTeamIds: string[] | null
  private readonly grantedPageIds: Set<number> | null
  private readonly grantedPageKeys: string[] | null
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
    this.grantedPageKeys = grantedPageIds
    this.dataLoader = dataLoader
  }

  serialize(): SerializedResourceGrants {
    return {
      grantedOrgIds: this.grantedOrgIds,
      grantedTeamIds: this.grantedTeamIds,
      grantedPageIds: this.grantedPageKeys
    }
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

  isUnrestricted() {
    return (
      this.grantedPageIds === null && this.grantedTeamIds === null && this.grantedOrgIds === null
    )
  }

  hasPageGrants() {
    return !!this.grantedPageIds?.size
  }

  grantsPage(pageId: Expression<number>): Expression<SqlBool> {
    if (this.isUnrestricted()) return eb.lit(true)
    const {grantedOrgIds, grantedPageIds} = this
    const orgShares = eb
      .selectFrom('PageOrganizationAccess')
      .select('orgId')
      .where('pageId', '=', pageId)
    const teamShares = eb.selectFrom('PageTeamAccess').select('teamId').where('pageId', '=', pageId)
    const grants: Expression<SqlBool>[] = []
    if (grantedPageIds?.size) grants.push(eb(pageId, 'in', [...grantedPageIds]))
    if (grantedOrgIds === null) {
      grants.push(eb.exists(orgShares))
    } else if (grantedOrgIds.length > 0) {
      grants.push(eb.exists(orgShares.where('orgId', 'in', grantedOrgIds)))
    }
    grants.push(
      eb.exists(teamShares.where(({ref}) => this.grantsTeam(ref('PageTeamAccess.teamId'))))
    )
    return eb.or(grants)
  }

  grantsTeam(teamId: Expression<string>): Expression<SqlBool> {
    const {grantedOrgIds, grantedTeamIds} = this
    if (grantedTeamIds === null || grantedOrgIds === null) return eb.lit(true)
    const grants: Expression<SqlBool>[] = []
    if (grantedTeamIds.length > 0) grants.push(eb(teamId, 'in', grantedTeamIds))
    if (grantedOrgIds.length > 0) {
      const grantedOrgTeams = eb.selectFrom('Team').select('id').where('orgId', 'in', grantedOrgIds)
      grants.push(eb(teamId, 'in', grantedOrgTeams))
    }
    return eb.or(grants)
  }

  async hasPage(pageId: number): Promise<boolean> {
    const userRole = await this.dataLoader
      .get('pageAccessByPageIdUserId')
      .load({pageId, userId: this.userId})
    if (!userRole) return false
    if (this.isUnrestricted() || this.grantedPageIds?.has(pageId)) return true
    const grantedPage = await getKysely()
      .selectFrom('Page')
      .select('id')
      .where('id', '=', pageId)
      .where(({ref}) => this.grantsPage(ref('Page.id')))
      .executeTakeFirst()
    return !!grantedPage
  }
}
