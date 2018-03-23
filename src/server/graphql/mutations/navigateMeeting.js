import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/utils/constants';
import {sendNotMeetingFacilitatorError} from 'server/utils/authorizationErrors';
import NavigateMeetingPayload from 'server/graphql/types/NavigateMeetingPayload';
import {sendMeetingNotFoundError, sendStageNotFoundError} from 'server/utils/docNotFoundErrors';
import findStageById from 'universal/utils/meetings/findStageById';
import handleCompletedStage from 'server/graphql/mutations/helpers/handleCompletedStage';

export default {
  type: NavigateMeetingPayload,
  description: 'update a meeting by marking an item complete and setting the facilitator location',
  args: {
    completedStageId: {
      type: GraphQLID,
      description: 'The stage that the facilitator would like to mark as complete'
    },
    facilitatorStageId: {
      type: GraphQLID,
      description: 'The stage where the facilitator is'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting ID'
    }
  },
  async resolve(source,
    {completedStageId, facilitatorStageId, meetingId},
    {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    const meeting = await r.table('NewMeeting').get(meetingId).default(null);
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);
    const {facilitatorUserId, phases, teamId} = meeting;
    if (viewerId !== facilitatorUserId) return sendNotMeetingFacilitatorError(authToken, viewerId);

    // VALIDATION
    if (completedStageId) {
      const completedStageRes = findStageById(phases, completedStageId);
      if (!completedStageRes) return sendStageNotFoundError(authToken, completedStageId);
      const {stage} = completedStageRes;
      if (!stage.isComplete) {
        // MUTATIVE
        stage.isComplete = true;
        stage.endAt = now;
        // handle any side effects
        handleCompletedStage(stage, meeting);
      }
    }
    if (facilitatorStageId) {
      const facilitatorStageRes = findStageById(phases, facilitatorStageId);
      if (!facilitatorStageRes) return sendStageNotFoundError(authToken, facilitatorStageId);
      const {stage: facilitatorStage} = facilitatorStageRes;
      // mutative
      facilitatorStage.startAt = facilitatorStage.startAt || now;
      facilitatorStage.viewCount = facilitatorStage.viewCount ? facilitatorStage.viewCount + 1 : 1;
    }

    // RESOLUTION
    const oldFacilitatorStageId = await r.table('NewMeeting').get(meetingId)
      .update({
        facilitatorStageId,
        phases,
        updatedAt: now
      }, {returnChanges: true})('changes')(0)('old_val')('facilitatorStageId');

    const data = {meetingId, oldFacilitatorStageId, facilitatorStageId};
    publish(TEAM, teamId, NavigateMeetingPayload, data, subOptions);
    return data;
  }
};
