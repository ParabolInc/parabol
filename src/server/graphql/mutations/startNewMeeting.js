import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import shortid from 'shortid';
import {TEAM} from 'universal/utils/constants';
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum';
import extendNewMeetingForType from 'server/graphql/mutations/helpers/extendNewMeetingForType';
import createNewMeetingPhases from 'server/graphql/mutations/helpers/createNewMeetingPhases';
import {startSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendAlreadyStartedMeetingError} from 'server/utils/alreadyMutatedErrors';
import sendAuthRaven from 'server/utils/sendAuthRaven';
import extendMeetingMembersForType from 'server/graphql/mutations/helpers/extendMeetingMembersForType';
import createMeetingMember from 'server/graphql/mutations/helpers/createMeetingMember';

export default {
  type: StartNewMeetingPayload,
  description: 'Start a new meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    },
    meetingType: {
      type: new GraphQLNonNull(MeetingTypeEnum),
      description: 'The base type of the meeting (action, retro, etc)'
    }
  },
  async resolve(source, {teamId, meetingType}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);

    // VALIDATION
    const {team, meetingCount} = await r({
      team: r.table('Team').get(teamId),
      meetingCount: r.table('NewMeeting')
        .getAll(teamId, {index: 'teamId'})
        .count()
        .default(0)
    });

    if (team.meetingId) return sendAlreadyStartedMeetingError(authToken, teamId);

    // RESOLUTION
    const meetingId = shortid.generate();
    let phases;
    try {
      phases = await createNewMeetingPhases(teamId, meetingId, meetingCount, meetingType, dataLoader);
    } catch (e) {
      const breadcrumb = {
        message: e.message,
        category: 'Start new meeting',
        data: {teamId}
      };
      return sendAuthRaven(authToken, 'Something went wrong', breadcrumb);
    }
    const facilitatorStageId = phases[0] && phases[0].stages[0] && phases[0].stages[0].id;
    const newMeetingBase = {
      id: meetingId,
      createdAt: now,
      updatedAt: now,
      facilitatorUserId: viewerId,
      facilitatorStageId,
      meetingNumber: meetingCount + 1,
      meetingType,
      phases,
      teamId
    };
    const newMeeting = extendNewMeetingForType(newMeetingBase);
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
    const createMemberForMeeting = createMeetingMember(meetingId, meetingType);
    const meetingMembersBase = teamMembers.map(createMemberForMeeting);
    const meetingMembers = await extendMeetingMembersForType(meetingMembersBase);
    await r({
      team: r.table('Team').get(teamId)
        .update({meetingId}),
      meeting: r.table('NewMeeting').insert(newMeeting),
      members: r.table('MeetingMember').insert(meetingMembers)
    });

    startSlackMeeting(teamId);
    const data = {teamId, meetingId};
    publish(TEAM, teamId, StartNewMeetingPayload, data, subOptions);
    return data;
  }
};
