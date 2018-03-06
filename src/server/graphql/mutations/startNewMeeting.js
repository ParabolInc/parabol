import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import shortid from 'shortid';
import {RETROSPECTIVE, TEAM} from 'universal/utils/constants';
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum';
import extendNewMeetingForType from 'server/graphql/mutations/helpers/extendNewMeetingForType';
import createNewMeetingPhases from 'server/graphql/mutations/helpers/createNewMeetingPhases';
import {startSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack';

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
    requireTeamMember(authToken, teamId);

    // VALIDATION
    const {team, meetingCount} = await r({
      team: r.table('Team').get(teamId),
      meetingCount: r.table('NewMeeting')
        .getAll(teamId, {index: 'teamId'})
        .count()
        .default(0)
    });

    if (team.meetingId) {
      throw new Error('A meeting has already been started!');
    }

    // RESOLUTION
    const meetingId = shortid.generate();
    const newMeetingBase = {
      id: meetingId,
      createdAt: now,
      facilitatorUserId: viewerId,
      meetingNumber: meetingCount + 1,
      phases: await createNewMeetingPhases(teamId, meetingId, meetingCount, meetingType, dataLoader)
    };
    const newMeeting = extendNewMeetingForType(newMeetingBase, RETROSPECTIVE);
    await r({
      team: r.table('Team').get(teamId)
        .update({meetingId}),
      meeting: r.table('NewMeeting').insert(newMeeting)
    });

    startSlackMeeting(teamId);
    const data = {teamId, meetingId};
    publish(TEAM, teamId, StartNewMeetingPayload, data, subOptions);
    return data;
  }
};
