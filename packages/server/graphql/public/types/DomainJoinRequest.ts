import {DomainJoinRequestResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import toGlobalId from '../../../utils/toGlobalId'
import {GQLContext} from '../../graphql'
import getRethink from '../../../database/rethinkDriver'

const DomainJoinRequest: DomainJoinRequestResolvers = {
  id: ({id}) => {
    return toGlobalId('DomainJoinRequest', id)
  },
  createdByEmail: async ({id}, _args, {dataLoader}) => {
    const request = await dataLoader.get('domainJoinRequests').loadNonNull(id)
    const user = await dataLoader.get('users').loadNonNull(request.createdBy)
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
    const leadTeams = await dataLoader.get('teams').loadMany(leadTeamIds)
    const validOrgIds = await r
      .table('Organization')
      .getAll(r.args(leadTeams.map((team) => team.orgId)))
      .filter({activeDomain: domain})('id')
      .run()

    const validTeams = leadTeams.filter((team) => validOrgIds.includes(team.orgId))
    return validTeams
  }
}

export default DomainJoinRequest
