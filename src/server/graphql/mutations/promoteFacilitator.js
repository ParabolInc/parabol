import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {FACILITATOR_DISCONNECTED, MEETING_UPDATED, NOTIFICATIONS_ADDED} from 'universal/utils/constants';

export default {
  type: UpdateMeetingPayload,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    disconnectedFacilitatorId: {
      type: GraphQLID,
      description: '(Relay) teamMemberId of the old facilitator, if they disconnected'
    },
    facilitatorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '(Relay) teamMemberId of the new facilitator for this meeting'
    }
  },
  async resolve(source, {disconnectedFacilitatorId, facilitatorId}, {authToken, getDataLoader, socketId}) {
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.id();
    dataLoader.share();

    // AUTH
    const {id: dbId, type} = fromGlobalId(facilitatorId);

    if (type !== 'TeamMember') {
      throw new Error('Invalid Team Member Id');
    }

    const [, teamId] = dbId.split('::');
    requireSUOrTeamMember(authToken, teamId);


    // VALIDATION
    const facilitatorMembership = await dataLoader.teamMembers.load(dbId);
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      throw new Error('facilitator is not active on that team');
    }

    // RESOLUTION
    const team = await r.table('Team').get(teamId).update({
      activeFacilitator: dbId
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
