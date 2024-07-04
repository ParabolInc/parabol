import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import isValid from '../../isValid'
import {DomainJoinRequestResolvers} from '../resolverTypes'

const DomainJoinRequest: DomainJoinRequestResolvers = {
  id: ({id}) => {
    return DomainJoinRequestId.join(id)
  },
  createdByEmail: async ({createdBy}, _args, {dataLoader}) => {
    const user = await dataLoader.get('users').loadNonNull(createdBy)
    return user.email
  },
  teams: async ({id}, _args, {authToken, dataLoader}: GQLContext) => {
    const viewerId = getUserId(authToken)
    const r = await getRethink()
    const user = (await dataLoader.get('users').loadNonNull(viewerId))!
    const teamIds = user.tms

    const request = await dataLoader.get('domainJoinRequests').loadNonNull(id)

    const {domain} = request

    const leadTeamMembers = await r
      .table('TeamMember')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isLead: true, userId: viewerId})
      .run()

    const leadTeamIds = leadTeamMembers.map((teamMember) => teamMember.teamId)
    const leadTeams = (await dataLoader.get('teams').loadMany(leadTeamIds)).filter(isValid)
    const teamOrgs = await Promise.all(
      leadTeams.map((t) => dataLoader.get('organizations').load(t.orgId))
    )
    const validOrgIds = teamOrgs.filter((org) => org.activeDomain === domain).map(({id}) => id)

    const validTeams = leadTeams.filter((team) => validOrgIds.includes(team.orgId))
    return validTeams
  }
}

export default DomainJoinRequest
