import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {DataLoaderWorker} from '../graphql'
import SegmentClientEventEnum from '../types/SegmentClientEventEnum'
import SegmentEventTrackOptions from '../types/SegmentEventTrackOptions'
import {getUserId, isTeamMember, isUserBillingLeader} from '../../utils/authorization'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import standardError from '../../utils/standardError'
import {ISegmentEventTrackOnMutationArguments} from '../../../universal/types/graphql'

const extraOptionsCreator = {
  HelpMenuOpen: async (viewerId: string, _dataLoader: DataLoaderWorker, _options: object) => {
    const r = getRethink()
    const meetingCount = await r
      .table('MeetingMember')
      .getAll(viewerId, {index: 'userId'})
      .count()
    return {
      meetingCount
    }
  }
}

const eventNameLookup = {
  UserLogout: 'User Logout',
  UserLogin: 'User Login',
  HelpMenuOpen: 'Help Menu Open'
}

export default {
  name: 'SegmentEventTrack',
  description: 'track an event in segment, like when errors are hit',
  type: GraphQLBoolean,
  args: {
    event: {
      type: new GraphQLNonNull(SegmentClientEventEnum)
    },
    options: {
      type: SegmentEventTrackOptions
    }
  },
  resolve: async (
    _source,
    {event, options}: ISegmentEventTrackOnMutationArguments,
    {authToken, dataLoader}
  ) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = options || {teamId: undefined, orgId: undefined}
    // const {teamId, orgId} = options || {}
    if (teamId) {
      // fail silently. they're being sneaky
      if (!isTeamMember(authToken, teamId)) {
        standardError(new Error('Failed input validation'), {userId: viewerId})
        return false
      }
    }
    if (orgId) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        standardError(new Error('Failed input validation'), {userId: viewerId})
        return false
      }
    }

    // RESOLUTION
    const getExtraOptions = extraOptionsCreator[event]
    const extraOptions = getExtraOptions ? await getExtraOptions(viewerId, dataLoader, options) : {}
    const eventName = eventNameLookup[event]
    sendSegmentEvent(eventName, viewerId, {...options, ...extraOptions}).catch()
    return true
  }
}
