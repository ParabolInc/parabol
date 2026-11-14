import {readFileSync} from 'node:fs'
import path from 'node:path'
import {addResolversToSchema} from '@graphql-tools/schema'
import {buildSchema, execute, parse} from 'graphql'
import User from '../graphql/public/types/User'

// rootSchema loads its resolvers with webpack's require.context, so add the ones this test needs onto the built SDL
const schema = addResolversToSchema({
  schema: buildSchema(
    readFileSync(path.join(__dirname, '../graphql/public/schema.graphql'), 'utf8')
  ),
  resolvers: {User}
})

const viewerId = 'user1'
const activeTeamId = 'activeTeam'
const archivedTeamId = 'archivedTeam'

// archiving a team keeps its members, but the auth token only lists the viewer's active teams
const dataLoader = {
  get: (name: string) => {
    switch (name) {
      case 'users':
        return {loadNonNull: async () => ({id: viewerId, email: 'user1@example.com'})}
      case 'teamIdsByUserId':
        return {load: async () => [activeTeamId]}
      case 'teamMembers':
        return {load: async () => ({isNotRemoved: true})}
      case 'teamInvitationsByTeamId':
        return {load: async () => []}
      default:
        throw new Error(`unexpected loader ${name}`)
    }
  }
}

const isOnTeam = async (teamId: string) => {
  const result = await execute({
    schema,
    document: parse(`query { viewer { teamInvitation(teamId: "${teamId}") { isOnTeam } } }`),
    rootValue: {viewer: {id: viewerId}},
    contextValue: {authToken: {sub: viewerId, rol: null, tms: [activeTeamId]}, dataLoader}
  })
  expect(result.errors).toBeUndefined()
  return (result.data as {viewer: {teamInvitation: {isOnTeam: boolean | null}}}).viewer
    .teamInvitation.isOnTeam
}

test('a member of an active team is on it', async () => {
  expect(await isOnTeam(activeTeamId)).toBe(true)
})

test('a member of an archived team is not on it, so the team page and this one agree', async () => {
  expect(await isOnTeam(archivedTeamId)).toBeNull()
})
