import type {GraphQLResolveInfo} from 'graphql'
import AuthToken from '../../../../database/types/AuthToken'
import type {User as UserType} from '../../../../postgres/types'
import {Logger} from '../../../../utils/Logger'
import type {GQLContext} from '../../../graphql'
import type {ResourceGrants} from '../../ResourceGrants'
import User from '../User'

jest.mock('../../../mutations/helpers/publishToEmbedder', () => ({
  getUserQueryJobData: jest.fn(),
  publishToEmbedder: jest.fn()
}))

const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})

beforeEach(() => {
  warn.mockClear()
})

const makeContext = (authToken: AuthToken, resourceGrants?: ResourceGrants) => {
  const loaders: Record<string, {load: (key: any) => Promise<unknown>}> = {
    teamIdsByUserId: {load: async () => ['grantedTeam', 'otherOrgTeam']},
    teamsWithUserSort: {load: async ({teamId}) => ({id: teamId, sortOrder: teamId})}
  }
  return {
    authToken,
    resourceGrants,
    dataLoader: {get: (name: string) => loaders[name]}
  } as unknown as GQLContext
}

const resolveTeams = (context: GQLContext) => {
  const {teams} = User
  if (typeof teams !== 'function') throw new Error('teams must be a function')
  return teams(
    {id: 'user1'} as UserType,
    {includeArchived: false},
    context,
    {} as GraphQLResolveInfo
  )
}

test('An access token granted fewer teams than the user is on keeps its teams', async () => {
  const authToken = new AuthToken({sub: 'user1', tms: ['grantedTeam'], aud: 'action-pat'})
  const resourceGrants = {
    hasTeam: async (teamId: string) => teamId === 'grantedTeam'
  } as unknown as ResourceGrants
  const context = makeContext(authToken, resourceGrants)
  const teams = await resolveTeams(context)
  expect(teams).toEqual([{id: 'grantedTeam', sortOrder: 'grantedTeam'}])
  expect(context.authToken).toBe(authToken)
  expect(context.authToken.tms).toEqual(['grantedTeam'])
})

test('A stale token outside an HTTP request lists every team without trying to set a cookie', async () => {
  const authToken = new AuthToken({sub: 'user1', tms: ['grantedTeam']})
  const context = makeContext(authToken)
  const teams = await resolveTeams(context)
  expect(teams).toEqual([
    {id: 'grantedTeam', sortOrder: 'grantedTeam'},
    {id: 'otherOrgTeam', sortOrder: 'otherOrgTeam'}
  ])
  expect(context.authToken.tms).toEqual(['grantedTeam', 'otherOrgTeam'])
  expect(context.authToken.jti).toBe(authToken.jti)
  expect(warn).not.toHaveBeenCalled()
})
