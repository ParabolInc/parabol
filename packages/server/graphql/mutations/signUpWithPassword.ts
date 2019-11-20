import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import SignUpWithPasswordPayload from '../types/SignUpWithPasswordPayload'
import standardError from '../../utils/standardError'
import bcrypt from 'bcrypt'
import User from '../../database/types/User'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import encodeAuthToken from '../../utils/encodeAuthToken'
import AuthToken from '../../database/types/AuthToken'
import shortid from 'shortid'
import {Security} from 'parabol-client/types/constEnums'
import TimelineEventJoinedParabol from '../../database/types/TimelineEventJoinedParabol'
import createNewOrg from './helpers/createNewOrg'
import createTeamAndLeader from './helpers/createTeamAndLeader'
import addSeedTasks from './helpers/addSeedTasks'
import SuggestedActionInviteYourTeam from '../../database/types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from '../../database/types/SuggestedActionTryTheDemo'
import SuggestedActionCreateNewTeam from '../../database/types/SuggestedActionCreateNewTeam'
import sleep from 'parabol-client/utils/sleep'
import segmentIo from '../../utils/segmentIo'
import rateLimit from '../rateLimit'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'

// no waiting necessary, it's just analytics
const handleSegment = async (userId: string, previousId: string) => {
  if (previousId) {
    await segmentIo.alias({previousId, userId})
    // https://segment.com/docs/destinations/mixpanel/#aliasing-server-side
    await sleep(1000)
  }
  return sendSegmentIdentify(userId)
}

const signUpWithPassword = {
  type: new GraphQLNonNull(SignUpWithPasswordPayload),
  description: 'Sign up using an email adress and password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    },
    isOrganic: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is signing up without a team invitation, else false'
    }
  },
  resolve: rateLimit({perMinute: 60, perHour: 1800})(
    async (_source, {email, isOrganic, password, segmentId}) => {
      const r = await getRethink()
      // AUTH
      const existingUser = await r
        .table<User>('User')
        .getAll(email, {index: 'email'})
        .nth(0)
        .default(null)
        .run()

      if (existingUser) {
        const {id: viewerId, identities, rol} = existingUser
        const localIdentity = identities.find(
          (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
        ) as AuthIdentityLocal
        if (!localIdentity) {
          const [bestIdentity] = identities
          if (!bestIdentity) {
            return standardError(new Error('No identity found! Please contact support'))
          }
          const {type} = bestIdentity
          return standardError(new Error(`user_exists_${type}`))
        }
        const {hashedPassword} = localIdentity
        // check password
        const isCorrectPassword = await bcrypt.compare(password, hashedPassword)
        if (isCorrectPassword) {
          // log them in
          sendSegmentIdentify(viewerId).catch()
          return {
            userId: viewerId,
            // create a brand new auth token using the tms in our DB, not auth0s
            authToken: encodeAuthToken(new AuthToken({sub: viewerId, rol, tms: existingUser.tms}))
          }
        }
        return {
          error: {
            message: 'User already exists'
          }
        }
      }

      // it's a new user!
      const nickname = email.substring(0, email.indexOf('@'))
      const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
      const hashedPassword = await bcrypt.hash(password, Security.SALT_ROUNDS)
      const userId = `u_${shortid.generate()}`
      const identityId = `${userId}:LOCAL`
      const identity = new AuthIdentityLocal({hashedPassword, id: identityId})
      const newUser = new User({
        id: userId,
        preferredName,
        email,
        identities: [identity],
        segmentId
      })

      const joinEvent = new TimelineEventJoinedParabol({userId})
      await r({
        user: r.table('User').insert(newUser),
        event: r.table('TimelineEvent').insert(joinEvent)
      }).run()

      const tms = [] as string[]
      if (isOrganic) {
        const orgId = shortid.generate()
        const teamId = shortid.generate()
        tms.push(teamId) // MUTATIVE
        const validNewTeam = {
          id: teamId,
          orgId,
          name: `${preferredName}’s Team`,
          isOnboardTeam: true
        }
        const orgName = `${newUser.preferredName}’s Org`
        await createNewOrg(orgId, orgName, userId)
        await Promise.all([
          createTeamAndLeader(userId, validNewTeam),
          addSeedTasks(userId, teamId),
          r
            .table('SuggestedAction')
            .insert(new SuggestedActionInviteYourTeam({userId, teamId}))
            .run()
        ])
      } else {
        await r
          .table('SuggestedAction')
          .insert([
            new SuggestedActionTryTheDemo({userId}),
            new SuggestedActionCreateNewTeam({userId})
          ])
          .run()
      }
      handleSegment(userId, segmentId).catch()

      return {
        authToken: encodeAuthToken(new AuthToken({sub: userId, tms})),
        userId
      }
    }
  )
}

export default signUpWithPassword
