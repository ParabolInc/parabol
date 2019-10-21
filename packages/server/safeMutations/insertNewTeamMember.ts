import getRethink from '../database/rethinkDriver'
import TeamMember from '../database/types/TeamMember'
import User from '../database/types/User'

const insertNewTeamMember = async (userId: string, teamId: string) => {
  const r = await getRethink()
  const user = await r
    .table<User>('User')
    .get(userId)
    .run()
  const {picture, preferredName, email} = user
  const checkInOrder = await r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isNotRemoved: true})
    .count()
    .run()
  const isLead = checkInOrder === 0
  const teamMember = new TeamMember({
    teamId,
    userId,
    picture,
    preferredName,
    email,
    checkInOrder,
    isLead
  })
  // conflict is possible if person was removed from the team + org & then rejoined (isNotRemoved would be false)
  return r
    .table('TeamMember')
    .insert(teamMember, {conflict: 'update', returnChanges: true})('changes')(0)('new_val')
    .default(null)
    .run()
}

export default insertNewTeamMember
