import {GQLContext} from './../../graphql'
import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {requireSU} from '../../../utils/authorization'

const lockTeams = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: 'Lock/Unlock teams, flagging them as unpaid/paid. Return true if successful',
  args: {
    teamIds: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLID)),
      description: 'List of teams to target'
    },
    isPaid: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true to unlock the teams, false to lock'
    },
    message: {
      type: GraphQLString,
      description: 'The HTML to show if isPaid is false'
    }
  },
  resolve: async (
    _source: unknown,
    {message, teamIds, isPaid}: {teamIds: string[]; isPaid: boolean; message?: string},
    {authToken}: GQLContext
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)
    const lockMessageHTML = isPaid ? null : message ?? null

    // RESOLUTION
    const updates = {
      isPaid,
      lockMessageHTML,
      updatedAt: new Date()
    }
    await Promise.all([
      r
        .table('Team')
        .getAll(r.args(teamIds))
        .update(updates)
        .run(),
      updateTeamByTeamId(updates, teamIds)
    ])
    return true
  }
}

export default lockTeams
