import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {requireSU} from '../../../utils/authorization'

const lockTeams = {
  type: GraphQLNonNull(GraphQLBoolean),
  description: 'Lock/Unlock teams, flagging them as unpaid/paid. Return true if successful',
  args: {
    teamIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLID)),
      description: 'List of teams to target'
    },
    isPaid: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true to unlock the teams, false to lock'
    }
  },
  resolve: async (
    _source,
    {teamIds, isPaid}: {teamIds: string[]; isPaid: boolean},
    {authToken}
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    await Promise.all([
      r
        .table('Team')
        .getAll(r.args(teamIds))
        .update({isPaid})
        .run(),
      updateTeamByTeamId({isPaid}, teamIds)
    ])
    return true
  }
}

export default lockTeams
