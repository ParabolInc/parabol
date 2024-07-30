import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
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
    const user = (await dataLoader.get('users').loadNonNull(viewerId))!
    const teamIds = user.tms

    const request = await dataLoader.get('domainJoinRequests').loadNonNull(id)

    const {domain} = request

    const teamMemberIds = teamIds.map((teamId) => TeamMemberId.join(teamId, viewerId))
    const leadTeamMembers = (await dataLoader.get('teamMembers').loadMany(teamMemberIds))
      .filter(isValid)
      .filter(({isLead}) => isLead)

    const leadTeamIds = leadTeamMembers.map((teamMember) => teamMember.teamId)
    const leadTeams = (await dataLoader.get('teams').loadMany(leadTeamIds)).filter(isValid)
    const teamOrgs = await Promise.all(
      leadTeams.map((t) => dataLoader.get('organizations').loadNonNull(t.orgId))
    )
    const validOrgIds = teamOrgs.filter((org) => org.activeDomain === domain).map(({id}) => id)

    const validTeams = leadTeams.filter((team) => validOrgIds.includes(team.orgId))
    return validTeams
  }
}

export default DomainJoinRequest
