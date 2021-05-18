import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
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
    },
    message: {
      type: GraphQLString,
      description: 'The HTML to show if isPaid is false'
    }
  },
  resolve: async (
    _source,
    {message, teamIds, isPaid}: {teamIds: string[]; isPaid: boolean; message?: string},
    {authToken}
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)
    const lockMessageHTML = isPaid ? null : message ?? null

    // RESOLUTION
    await Promise.all([
      r
        .table('Team')
        .getAll(r.args(teamIds))
        .update({isPaid, lockMessageHTML})
        .run(),
      updateTeamByTeamId({isPaid, lockMessageHTML}, teamIds)
    ])
    return true
  }
}

export default lockTeams
