import {readFileSync} from 'node:fs'
import path from 'node:path'
import {addResolversToSchema} from '@graphql-tools/schema'
import {buildSchema, parse, subscribe} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import composeResolvers from '../graphql/composeResolvers'
import permissions from '../graphql/public/permissions'
import notificationSubscription from '../graphql/public/subscriptions/notificationSubscription'
import getKysely from '../postgres/getKysely'
import getPubSub from '../utils/getPubSub'
import publish from '../utils/publish'
import {createPGTables} from './common'

const TEST_DB = 'broadcastSubscriptionTest'

// rootSchema loads its resolvers with webpack's require.context, so compose the parts this test needs onto the built SDL
const typeDefs = buildSchema(
  readFileSync(path.join(__dirname, '../graphql/public/schema.graphql'), 'utf8')
)
const schema = addResolversToSchema({
  schema: typeDefs,
  resolvers: composeResolvers({Subscription: {notificationSubscription}}, permissions, typeDefs),
  inheritResolversFromInterfaces: true
})

const DISCONNECT_SOCKET_SUBSCRIPTION = parse(`
  subscription DisconnectSocketSubscription {
    notificationSubscription {
      fieldName
      DisconnectSocketPayload {
        user {
          id
          isConnected
        }
      }
    }
  }
`)

describe('broadcastSubscription', () => {
  const pg = getKysely(TEST_DB)

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables('OrganizationUser')
  })

  afterAll(async () => {
    const {publisher, subscriber} = getPubSub()
    await Promise.all([publisher.quit(), subscriber.quit()])
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
  })

  const addOrgMembers = async () => {
    const orgId = generateUID()
    const viewerId = generateUID()
    const teammateId = generateUID()
    await pg
      .insertInto('OrganizationUser')
      .values([viewerId, teammateId].map((userId) => ({id: generateUID(), orgId, userId})))
      .execute()
    return {viewerId, teammateId}
  }

  const subscribeToNotifications = async (viewerId: string) => {
    const result = await subscribe({
      schema,
      document: DISCONNECT_SOCKET_SUBSCRIPTION,
      // what wsHandler.onSubscribe passes for a subscription
      contextValue: {
        authToken: new AuthToken({sub: viewerId, tms: []}),
        dataLoader: null,
        socketId: generateUID()
      }
    })
    if (!('next' in result)) throw new Error(JSON.stringify(result.errors))
    return result
  }

  // wsHandler publishes this outside of any mutation, so it has no operationId
  const publishDisconnect = (viewerId: string, teammateId: string) =>
    publish(SubscriptionChannel.NOTIFICATION, viewerId, 'DisconnectSocketPayload', {
      user: {id: teammateId, isConnected: false}
    })

  const disconnectEvent = (user: {id: string; isConnected: boolean | null}) => ({
    data: {
      notificationSubscription: {
        fieldName: 'DisconnectSocketPayload',
        DisconnectSocketPayload: {user}
      }
    }
  })

  test('resolves an event published outside of a mutation', async () => {
    const {viewerId, teammateId} = await addOrgMembers()
    const subscription = await subscribeToNotifications(viewerId)
    await publishDisconnect(viewerId, teammateId)
    const event = await subscription.next()
    await subscription.return()
    expect(event.value).toEqual(disconnectEvent({id: teammateId, isConnected: false}))
  })

  test('resolves each event published outside of a mutation against current data', async () => {
    const {viewerId, teammateId} = await addOrgMembers()
    const subscription = await subscribeToNotifications(viewerId)
    await publishDisconnect(viewerId, teammateId)
    const eventWhileOnOrg = await subscription.next()
    await pg
      .updateTable('OrganizationUser')
      .set({removedAt: new Date()})
      .where('userId', '=', teammateId)
      .execute()
    await publishDisconnect(viewerId, teammateId)
    const eventAfterLeavingOrg = await subscription.next()
    await subscription.return()
    expect(eventWhileOnOrg.value).toEqual(disconnectEvent({id: teammateId, isConnected: false}))
    expect(eventAfterLeavingOrg.value).toEqual(disconnectEvent({id: teammateId, isConnected: null}))
  })
})
