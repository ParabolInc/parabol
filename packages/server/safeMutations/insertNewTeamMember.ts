import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../database/rethinkDriver'
import TeamMember from '../database/types/TeamMember'
import db from '../db'

const insertNewTeamMember = async (userId: string, teamId: string) => {
  const r = await getRethink()
  const now = new Date()
  const teamMemberId = toTeamMemberId(teamId, userId)
  const [user, checkInOrder, existingTeamMember] = await Promise.all([
    db.read('User', userId),
    r
      .table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({isNotRemoved: true})
      .count()
      .run(),
    r
      .table('TeamMember')
      .get(teamMemberId)
      .run()
  ])
  if (existingTeamMember) {
    existingTeamMember.isNotRemoved = true
    existingTeamMember.updatedAt = now
    await r
      .table('TeamMember')
      .get(teamMemberId)
      .replace(existingTeamMember)
      .run()
    return existingTeamMember
  }

  const {picture, preferredName, email} = user
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
  await r
    .table('TeamMember')
    .insert(teamMember)
    .run()
  return teamMember
}

export default insertNewTeamMember
