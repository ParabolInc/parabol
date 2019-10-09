import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {verify} from 'jsonwebtoken'
import getRethink from '../../database/rethinkDriver'
import LoginPayload from '../types/LoginPayload'
import {
  clientId as auth0ClientId,
  clientSecret as auth0ClientSecret
} from '../../utils/auth0Helpers'
import {getUserId} from '../../utils/authorization'
import {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import ensureDate from '../../../client/utils/ensureDate'
import shortid from 'shortid'
import segmentIo from '../../utils/segmentIo'
import sleep from '../../../client/utils/sleep'
import createNewOrg from './helpers/createNewOrg'
import createTeamAndLeader from './helpers/createTeamAndLeader'
import addSeedTasks from './helpers/addSeedTasks'
import standardError from '../../utils/standardError'
import AuthToken from '../../database/types/AuthToken'
import encodeAuthToken from '../../utils/encodeAuthToken'
import SuggestedActionTryTheDemo from '../../database/types/SuggestedActionTryTheDemo'
import SuggestedActionCreateNewTeam from '../../database/types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from '../../database/types/SuggestedActionInviteYourTeam'
import TimelineEventJoinedParabol from '../../database/types/TimelineEventJoinedParabol'
import User from '../../database/types/User'
import getAuth0ManagementClient from '../../utils/getAuth0ManagementClient'

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
    isOrganic: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is signing up without a team invitation, else false'
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    }
  },

  async resolve (_source, {auth0Token, isOrganic, segmentId}, {dataLoader}) {
    const r = getRethink()
    const now = new Date()

    // VALIDATION
    let authToken
    try {
      authToken = verify(auth0Token, Buffer.from(auth0ClientSecret!, 'base64'), {
        audience: auth0ClientId
      })
    } catch (e) {
      return standardError(new Error('Not authenticated'))
    }
    const viewerId = getUserId(authToken)

    const existingUser = await dataLoader.get('users').load(viewerId) as User | null

    // RESOLUTION
    if (existingUser){
      // LOGIN
      /*
       * The segment docs are inconsistent, and warn against sending
       * identify() on each log in. However, calling identify is the
       * only way to synchronize changing user properties with certain
       * services (such as Hubspot). After checking with support
       * and combing the forums, it turns out sending identify()
       * on each login is just fine.
       *
       * See also: https://community.segment.com/t/631m9s/identify-per-signup-or-signin
       * Note: no longer awaiting the identify call since it's getting pretty expensive
       */
      sendSegmentIdentify(viewerId).catch()
      return {
        userId: viewerId,
        // create a brand new auth token using the tms in our DB, not auth0s
        authToken: encodeAuthToken(new AuthToken({...authToken, tms: existingUser.tms}))
      }
    }

    dataLoader.get('users').clear(viewerId)
    let userInfo
    try {
      userInfo = await getAuth0ManagementClient().getUser({
        id: authToken.sub
      })
    } catch (e) {
      return standardError(new Error('Failed authentication'))
    }

    // make sure we don't create 2 users with the same email!
    const existingUserWithSameEmail = await r
      .table('User')
      .getAll(userInfo.email, {index: 'email'})
      .nth(0)
      .default(null)
    if (existingUserWithSameEmail) {
      return standardError(new Error(`user_exists_${existingUserWithSameEmail.identities[0].provider}`))
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
      createdAt: now,
      segmentId,
      tms: []
    }

    const joinEvent = new TimelineEventJoinedParabol({userId: newUser.id})
    await r({
      user: r.table('User').insert(newUser),
      event: r.table('TimelineEvent').insert(joinEvent)
    })

    let returnAuthToken
    if (isOrganic) {
      const orgId = shortid.generate()
      const teamId = shortid.generate()
      const validNewTeam = {
        id: teamId,
        orgId,
        name: `${newUser.preferredName}’s Team`,
        isOnboardTeam: true
      }
      const orgName = `${newUser.preferredName}’s Org`
      await createNewOrg(orgId, orgName, viewerId)
      await Promise.all([
        createTeamAndLeader(viewerId, validNewTeam),
        addSeedTasks(viewerId, teamId),
        r.table('SuggestedAction').insert(new SuggestedActionInviteYourTeam({userId: newUser.id, teamId}))
      ])
      // ensure the return auth token has the correct tms, if !isOrganic, acceptTeamInvite will return its own with the proper tms
      returnAuthToken = encodeAuthToken(new AuthToken({...authToken, tms: [teamId]}))
      // create invite your team SA
      // it goes away when someone joins that team or team is deleted

      // when someone joins a team where team.isNew == true, you get 3 CTAs: run retro, create team, run action
      // run retro goes away after a retro completes
      // create team goes away after they create a team
      // run action goes away action action completes
      // the meetings goe away if team is deleted
    } else {
      returnAuthToken = auth0Token
      await r.table('SuggestedAction').insert([
        new SuggestedActionTryTheDemo({userId: newUser.id}),
        new SuggestedActionCreateNewTeam({userId: newUser.id})
      ])
      // create run a demo cta and create a team cta
      // it goes away after they click it
    }

    // no waiting necessary, it's just analytics
    handleSegment(newUser.id, segmentId).catch()

    return {
      authToken: returnAuthToken,
      userId: viewerId
    }
  }
}

export default login
