import {ExtractTypeFromQueryBuilderSelect} from '../../../../client/types/generics'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {selectRetroReflections} from '../../../dataloader/primaryKeyLoaderMakers'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import getGroupedReactjis from '../../../utils/getGroupedReactjis'
import {RetroReflectionResolvers} from '../resolverTypes'

export interface RetroReflectionSource
  extends ExtractTypeFromQueryBuilderSelect<typeof selectRetroReflections> {}

const RetroReflection: RetroReflectionResolvers = {
  creatorId: async ({creatorId, meetingId}, _args, {authToken, dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {meetingType} = meeting
    if (!isSuperUser(authToken) && (meetingType !== 'retrospective' || !meeting.disableAnonymity)) {
      return null
    }
    return creatorId
  },

  creator: async ({creatorId, meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {meetingType} = meeting

    // let's not allow super users to grap this in case the UI does not check `disableAnonymity` in which case
    // reflection authors would be always visible for them
    if (meetingType !== 'retrospective' || !meeting.disableAnonymity || !creatorId) {
      return null
    }
    return dataLoader.get('users').loadNonNull(creatorId)
  },

  editorIds: () => [],
  isActive: ({isActive}) => !!isActive,

  isViewerCreator: ({creatorId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === creatorId
  },

  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingRetrospective
  },

  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').load(promptId)
  },

  reactjis: ({reactjis, id}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return getGroupedReactjis(reactjis, viewerId, id)
  },

  retroReflectionGroup: async ({reflectionGroupId}, _args, {dataLoader}) => {
    return dataLoader.get('retroReflectionGroups').loadNonNull(reflectionGroupId)
  },

  team: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return dataLoader.get('teams').loadNonNull(meeting.teamId)
  }
}

export default RetroReflection
