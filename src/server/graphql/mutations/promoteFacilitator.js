import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {FACILITATOR_DISCONNECTED, MEETING_UPDATED, NOTIFICATIONS_ADDED} from 'universal/utils/constants';

export default {
  type: UpdateMeetingPayload,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    disconnectedFacilitatorId: {
      type: GraphQLID,
      description: 'teamMemberId of the old facilitator, if they disconnected'
    },
    facilitatorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'teamMemberId of the new facilitator for this meeting'
    }
  },
  async resolve(source, {disconnectedFacilitatorId, facilitatorId}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const operationId = dataLoader.share();

    const [, teamId] = facilitatorId.split('::');
    requireTeamMember(authToken, teamId);


    // VALIDATION
    const facilitatorMembership = await dataLoader.get('teamMembers').load(facilitatorId);
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      throw new Error('facilitator is not active on that team');
    }

    // RESOLUTION
    const team = await r.table('Team').get(teamId).update({
      activeFacilitator: facilitatorId
    }, {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!team) {
      throw new Error('That person is already is the facilitator');
    }

    const meetingUpdated = {team};
    if (disconnectedFacilitatorId) {
      const notification = {
        oldFacilitatorId: disconnectedFacilitatorId,
        newFacilitatorId: facilitatorId,
        teamId,
        type: FACILITATOR_DISCONNECTED
      };
      const notificationsAdded = {notifications: [notification]};
      // don't include the mutatorId here because that will allow the sender to get a toast
      getPubSub().publish(`${NOTIFICATIONS_ADDED}.${teamId}`, {notificationsAdded, operationId});
    } else {
      getPubSub().publish(`${MEETING_UPDATED}.${teamId}`, {meetingUpdated, mutatorId: socketId, operationId});
    }

    return meetingUpdated;
  }
};
