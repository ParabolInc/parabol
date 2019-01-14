import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {verify} from 'jsonwebtoken'
import getRethink from 'server/database/rethinkDriver'
import LoginPayload from 'server/graphql/types/LoginPayload'
import {
  auth0ManagementClient,
  clientId as auth0ClientId,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers'
import {getUserId} from 'server/utils/authorization'
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import makeAuthTokenObj from 'server/utils/makeAuthTokenObj'
import {sendAuth0Error, sendBadAuthTokenError} from 'server/utils/authorizationErrors'
import encodeAuthTokenObj from 'server/utils/encodeAuthTokenObj'
import ensureDate from 'universal/utils/ensureDate'
import shortid from 'shortid'
import {JOINED_PARABOL} from 'server/graphql/types/TimelineEventTypeEnum'
import segmentIo from 'server/utils/segmentIo'
import sleep from 'universal/utils/sleep'

const handleSegment = async (userId, previousId) => {
  if (previousId) {
    await segmentIo.alias({previousId, userId})
    // https://segment.com/docs/destinations/mixpanel/#aliasing-server-side
    await sleep(1000)
  }
  return sendSegmentIdentify(userId)
}

const login = {
  type: new GraphQLNonNull(LoginPayload),
  description: 'Log in, or sign up if it is a new user',
  args: {
    // even though the token comes with the bearer, we include it here we use it like an arg since the gatekeeper
    // decodes it into an object
    auth0Token: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID Token from auth0, a base64 JWT'
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    }
  },
  async resolve (source, {auth0Token, segmentId}, {dataLoader}) {
    const r = getRethink()
    const now = new Date()

    // VALIDATION
    let authToken
    try {
      authToken = verify(auth0Token, Buffer.from(auth0ClientSecret, 'base64'), {
        audience: auth0ClientId
      })
    } catch (e) {
      return sendBadAuthTokenError()
    }
    const viewerId = getUserId(authToken)

    // RESOLUTION
    if (authToken.tms) {
      const user = await dataLoader.get('users').load(viewerId)
      // LOGIN
      if (user) {
        /*
         * The segment docs are inconsistent, and warn against sending
         * identify() on each log in. However, calling identify is the
         * only way to synchronize changing user properties with certain
         * services (such as Hubspot). After checking with support
         * and combing the forums, it turns out sending identify()
         * on each login is just fine.
         *
         * See also: https://community.segment.com/t/631m9s/identify-per-signup-or-signin
         */
        await sendSegmentIdentify(user.id)
        return {
          userId: viewerId,
          // create a brand new auth token using the tms in our DB, not auth0s
          authToken: encodeAuthTokenObj(makeAuthTokenObj({...authToken, tms: user.tms}))
        }
      }
      // should never reach this line in production. that means our DB !== auth0 DB
    }

    let userInfo
    try {
      userInfo = await auth0ManagementClient.getUser({
        id: authToken.sub
      })
    } catch (e) {
      return sendAuth0Error(authToken, e)
    }

    const preferredName =
      userInfo.nickname.length === 1 ? userInfo.nickname.repeat(2) : userInfo.nickname
    const newUser = {
      id: userInfo.user_id,
      cachedAt: now,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      featureFlags: [],
      lastLogin: now,
      updatedAt: ensureDate(userInfo.updated_at),
      picture: userInfo.picture,
      inactive: false,
      name: userInfo.name,
      preferredName,
      identities: userInfo.identities || [],
      createdAt: ensureDate(userInfo.created_at),
      segmentId
    }
    await r({
      user: r.table('User').insert(newUser),
      event: r.table('TimelineEvent').insert({
        id: shortid.generate(),
        createdAt: newUser.createdAt,
        interactionCount: 0,
        seenCount: 0,
        eventType: JOINED_PARABOL,
        userId: newUser.id
      })
    })

    // no waiting necessary, it's just analytics
    handleSegment(newUser.id, segmentId)

    return {
      authToken: auth0Token,
      userId: viewerId
    }
  }
}

export default login
