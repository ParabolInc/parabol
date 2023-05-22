import {DomainJoinRequestResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {GQLContext} from '../../graphql'
import getRethink from '../../../database/rethinkDriver'

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
