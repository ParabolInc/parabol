// DEPRECATED. USE LOGINSAML
import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import shortid from 'shortid'
import User from '../../../database/types/User'
import TimelineEventJoinedParabol from '../../../database/types/TimelineEventJoinedParabol'
import SuggestedActionTryTheDemo from '../../../database/types/SuggestedActionTryTheDemo'
import SuggestedActionCreateNewTeam from '../../../database/types/SuggestedActionCreateNewTeam'
import {sendSegmentIdentify} from '../../../utils/sendSegmentEvent'
import LoginSSOPayload from '../types/LoginSSOPayload'
import getRethink from '../../../database/rethinkDriver'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import AuthToken from '../../../database/types/AuthToken'
import createNewOrg from '../../mutations/helpers/createNewOrg'
import createTeamAndLeader from '../../mutations/helpers/createTeamAndLeader'
import addSeedTasks from '../../mutations/helpers/addSeedTasks'
import SuggestedActionInviteYourTeam from '../../../database/types/SuggestedActionInviteYourTeam'

const loginSSO = {
  type: new GraphQLNonNull(LoginSSOPayload),
  description: 'Log in using single sign on (SSO)',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The SSO email'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The user name'
    },
    isInvited: {
      type: GraphQLBoolean,
      description: 'true if this is part of an invitation'
    }
  },
  async resolve(_source, {email, name, isInvited}) {
    const r = await getRethink()
    const now = new Date()

    const user = await r
      .table('User')
      .getAll(email, {index: 'email'})
      .nth(0)
      .default(null)
      .run()
    if (user) {
      sendSegmentIdentify(user.id).catch()
      return {
        authToken: encodeAuthToken(new AuthToken({sub: user.id, tms: user.tms}))
      }
    }

    const userId = `sso|${shortid.generate()}`
    const newUser = new User({
      id: userId,
      email,
      preferredName: name,
      emailVerified: true,
      lastLogin: now
    })
    const joinEvent = new TimelineEventJoinedParabol({userId})
    await r({
      user: r.table('User').insert(newUser),
      event: r.table('TimelineEvent').insert(joinEvent)
    }).run()

    if (isInvited) {
      await r
        .table('SuggestedAction')
        .insert([
          new SuggestedActionTryTheDemo({userId}),
          new SuggestedActionCreateNewTeam({userId})
        ])
        .run()
      sendSegmentIdentify(userId).catch()
      return {
        authToken: encodeAuthToken(new AuthToken({sub: userId, tms: []}))
      }
    }

    const orgId = shortid.generate()
    const teamId = shortid.generate()
    const validNewTeam = {
      id: teamId,
      orgId,
      name: `${newUser.preferredName}’s Team`,
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
    sendSegmentIdentify(userId).catch()
    return {
      authToken: encodeAuthToken(new AuthToken({sub: userId, tms: [teamId]}))
    }
  }
}

export default loginSSO
