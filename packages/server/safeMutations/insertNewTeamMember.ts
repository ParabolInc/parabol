import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../database/rethinkDriver'
import TeamMember from '../database/types/TeamMember'
import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import IUser from '../postgres/types/IUser'

const insertNewTeamMember = async (user: IUser, teamId: string, dataLoader: DataLoaderInstance) => {
  const r = await getRethink()
  const now = new Date()
  const {id: userId} = user
  const teamMemberId = toTeamMemberId(teamId, userId)
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const existingTeamMember = teamMembers.find((tm) => tm.userId === userId)
  const teamMemberCount = teamMembers.length

  if (!user) {
    throw new Error('User does not exist')
  }
  if (existingTeamMember) {
    existingTeamMember.isNotRemoved = true
    existingTeamMember.updatedAt = now
    await r.table('TeamMember').get(teamMemberId).replace(existingTeamMember).run()
    dataLoader.clearAll('teamMembers')
    return existingTeamMember
  }

  const {picture, preferredName, email} = user
  const isLead = teamMemberCount === 0
  const teamMember = new TeamMember({
    teamId,
    userId,
    picture,
    preferredName,
    email,
    isLead,
    openDrawer: 'manageTeam'
  })

  await r.table('TeamMember').insert(teamMember).run()
  return teamMember
}

export default insertNewTeamMember
