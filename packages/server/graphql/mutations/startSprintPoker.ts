import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {IStartNewMeetingOnMutationArguments, MeetingTypeEnum} from 'parabol-client/types/graphql'
import DimensionScaleMapping from '../../database/types/DimensionScaleMapping'
import getRethink from '../../database/rethinkDriver'
import MeetingPoker from '../../database/types/MeetingPoker'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartSprintPokerPayload from '../types/StartSprintPokerPayload'
import createMeetingMembers from './helpers/createMeetingMembers'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import {startSlackMeeting} from './helpers/notifySlack'
import sendMeetingStartToSegment from './helpers/sendMeetingStartToSegment'

export default {
  type: new GraphQLNonNull(StartSprintPokerPayload),
  description: 'Start a new sprint poker meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    }
  },
  async resolve(
    _source,
    {teamId}: IStartNewMeetingOnMutationArguments,
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const DUPLICATE_THRESHOLD = 3000
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Not on team'), {userId: viewerId})
    }

    const meetingType = 'poker' as MeetingTypeEnum

    // RESOLUTION
    const meetingCount = await r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({meetingType})
      .count()
      .default(0)
      .run()

    const phases = await createNewMeetingPhases(teamId, meetingCount, meetingType, dataLoader)
    const meetingSettings = (await dataLoader
      .get('meetingSettingsByType')
      .load({teamId, meetingType: MeetingTypeEnum.poker})) as MeetingSettingsPoker
    const {selectedTemplateId} = meetingSettings
    const dimensions = await dataLoader.get('dimensionsByTemplateId').load(selectedTemplateId)
    const dimensionScaleMapping = dimensions.map(
      (dimension) =>
        new DimensionScaleMapping({
          dimensionId: dimension.id,
          scaleId: dimension.scaleId
        })
    )

    const meeting = new MeetingPoker({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId: viewerId,
      templateId: selectedTemplateId,
      dimensionScaleMapping
    })
    const meetingId = meeting.id
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
    const meetingMembers = createMeetingMembers(meeting, teamMembers)
    await r.table('NewMeeting').insert(meeting).run()

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {createdAt, id} = activeMeeting
      if (id === meetingId || activeMeeting.meetingType !== 'poker') return false
      return createdAt.getTime() > Date.now() - DUPLICATE_THRESHOLD
    })
    if (otherActiveMeeting) {
      await r.table('NewMeeting').get(meetingId).delete().run()
      return {error: {message: 'Meeting already started'}}
    }

    await Promise.all([
      r.table('MeetingMember').insert(meetingMembers).run(),
      r.table('Team').get(teamId).update({lastMeetingType: meetingType}).run()
    ])
    startSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    sendMeetingStartToSegment(meeting, template)
    const data = {teamId, meetingId: meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartSprintPokerSuccess', data, subOptions)
    return data
  }
}
