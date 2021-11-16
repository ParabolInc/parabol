import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {isTeamLead, requireSU} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import GraphQLEmailType from '../../types/GraphQLEmailType'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'

const setNewTeamLead = {
  type: GraphQLNonNull(GraphQLBoolean),
  description: 'Sets given team member as a team leader. ',
  args: {
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'Team id of the team which is about to get a new team leader'
    },
    newTeamLeadEmail: {
      type: GraphQLNonNull(GraphQLEmailType),
      description: 'Email of the user who will be set as a new team leader'
    }
  },
  resolve: async (
    _source,
    {teamId, newTeamLeadEmail}: {teamId: string; newTeamLeadEmail: string},
    {authToken}: InternalContext
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    const user = await getUserByEmail(newTeamLeadEmail)
    if (!user) {
      throw new Error(`User with ${newTeamLeadEmail} not found!`)
    }

    if (await isTeamLead(user.id, teamId)) {
      throw new Error(`Already a team lead!`)
    }

    // downgrade old team leader(s)
    await r
      .table('TeamMember')
      .filter({teamId, isLead: true})
      .update({
        isLead: false
      })
      .run()

    // set a new team lead
    const result = await r
      .table('TeamMember')
      .filter({email: newTeamLeadEmail, teamId})
      .update({
        isLead: true
      })
      .run()

    return result.replaced === 1
  }
}

export default setNewTeamLead
