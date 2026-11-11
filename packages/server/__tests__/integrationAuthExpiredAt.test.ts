import getKysely from '../postgres/getKysely'
import deactivateTeamMemberIntegrationAuthFamily from '../postgres/queries/deactivateTeamMemberIntegrationAuthFamily'
import {sendPublic, signUp} from './common'

const SERVICES_QUERY = `
  query Services($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        services {
          service
          isConnected
          expiredAt
        }
      }
    }
  }
`

const REMOVE_AUTH = `
  mutation RemoveAuth($teamId: ID!) {
    removeTeamMemberIntegrationAuth(service: linear, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const connectLinear = async (userId: string, teamId: string) => {
  const pg = getKysely()
  const provider = await pg
    .selectFrom('IntegrationProvider')
    .select('id')
    .where('service', '=', 'linear')
    .where('isActive', '=', true)
    .executeTakeFirst()
  const providerId =
    provider?.id ??
    (
      await pg
        .insertInto('IntegrationProvider')
        .values({
          service: 'linear',
          authStrategy: 'oauth2',
          scope: 'global',
          clientId: 'test-client',
          clientSecret: 'test-secret',
          serverBaseUrl: 'https://linear.app'
        })
        .returning('id')
        .executeTakeFirstOrThrow()
    ).id
  await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values({
      userId,
      teamId,
      providerId,
      service: 'linear',
      isActive: true,
      accessToken: 'test-token',
      providerUserId: `linear-${userId}`
    })
    .execute()
  return providerId
}

const linearService = async (cookie: string, teamId: string) => {
  const res = await sendPublic({query: SERVICES_QUERY, variables: {teamId}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data.viewer.teamMember.services.find(
    ({service}: {service: string}) => service === 'linear'
  ) as {isConnected: boolean; expiredAt: string | null}
}

test('a working connection has no expiredAt', async () => {
  const {userId, teamId, cookie} = await signUp()
  await connectLinear(userId, teamId)
  expect(await linearService(cookie, teamId)).toMatchObject({isConnected: true, expiredAt: null})
})

test('a grant the service rejected reports when it expired', async () => {
  const {userId, teamId, cookie} = await signUp()
  const providerId = await connectLinear(userId, teamId)
  const before = Date.now()
  await deactivateTeamMemberIntegrationAuthFamily({
    userId,
    teamId,
    providerId,
    providerUserId: `linear-${userId}`
  })
  const linear = await linearService(cookie, teamId)
  expect(linear.isConnected).toBe(false)
  expect(new Date(linear.expiredAt!).getTime()).toBeGreaterThanOrEqual(before - 1000)
})

test('disconnecting on purpose is not reported as expired', async () => {
  const {userId, teamId, cookie} = await signUp()
  await connectLinear(userId, teamId)
  const removed = await sendPublic({query: REMOVE_AUTH, variables: {teamId}, cookie})
  expect(removed.errors).toBeUndefined()
  expect(await linearService(cookie, teamId)).toMatchObject({isConnected: false, expiredAt: null})
})

test('a service that was never connected has no expiredAt', async () => {
  const {teamId, cookie} = await signUp()
  expect(await linearService(cookie, teamId)).toMatchObject({isConnected: false, expiredAt: null})
})
