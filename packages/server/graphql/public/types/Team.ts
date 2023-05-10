import getKysely from '../../../postgres/getKysely'
import {TeamResolvers} from '../resolverTypes'
import isValid from '../../isValid'

const Team: TeamResolvers = {
  userInteractions: async ({id: teamId}, {afterDate, beforeDate}, {dataLoader}) => {
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const userIds = teamMembers.filter(isValid).map((teamMember) => teamMember.userId)

    const pg = getKysely()
    const interactions = await pg
      .selectFrom('UserInteractions')
      .where('createdById', 'in', userIds)
      .where('receivedById', 'in', userIds)
      .selectAll()
      .execute()

    // TODO: actually use afterDate and beforeDate
    return {
      edges: interactions.map((node) => ({
        cursor: node.createdAt,
        node
      }))
    }
  }
}

export default Team
