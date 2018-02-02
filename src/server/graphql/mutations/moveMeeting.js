import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ActionMeetingPhaseEnum from 'server/graphql/types/ActionMeetingPhaseEnum';
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import {AGENDA_ITEM, AGENDA_ITEMS, CHECKIN, TEAM} from 'universal/utils/constants';

export default {
  type: MoveMeetingPayload,
  description: 'Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too.',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to make sure the socket calling has permission'
    },
    nextPhase: {
      type: ActionMeetingPhaseEnum,
      description: 'The desired phase for the meeting'
    },
    nextPhaseItem: {
      type: GraphQLInt,
      description: 'The item within the phase to set the meeting to'
    },
    force: {
      type: GraphQLBoolean,
      description: 'If true, execute the mutation without regard for meeting flow'
    }
  },
  async resolve(source, {force, teamId, nextPhase, nextPhaseItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    requireTeamMember(authToken, teamId);

    // BAILOUT
    if (force) {
      // use this if the meeting hit an infinite redirect loop. should never occur
      await r.table('Team').get(teamId).update({
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 1,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 1
      });
      publish(TEAM, teamId, MoveMeetingPayload, {teamId}, subOptions);
      return {teamId};
    }

    // VALIDATION
    const nextPhaseInfo = actionMeeting[nextPhase];
    const currentTeam = await r.table('Team').get(teamId);
    const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = currentTeam;
    const meetingPhaseInfo = actionMeeting[meetingPhase];
    if (nextPhase) {
      if (!nextPhaseInfo) {
        throw new Error(`${nextPhase} is not a valid phase`);
      }
      if (nextPhaseInfo.items) {
        const {arrayName} = nextPhaseInfo.items;
        if (arrayName === 'teamMembers') {
          const teamMembersCount = await r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .filter({isNotRemoved: true})
            .count();
          if (nextPhaseItem < 1 || nextPhaseItem > teamMembersCount) {
            throw new Error('We don’t have that many team members!');
          }
        } else if (arrayName === 'agendaItems') {
          const agendaItemCount = await r.table('AgendaItem')
            .getAll(teamId, {index: 'teamId'})
            .filter({isActive: true})
            .count();
          if (nextPhaseItem < 1 || nextPhaseItem > agendaItemCount) {
            throw new Error('We don’t have that many agenda items!');
          }
        }
        if (nextPhaseInfo.visitOnce && meetingPhaseInfo.index > nextPhaseInfo.index) {
          throw new Error('You can’t visit first call twice!');
        }
      } else if (nextPhaseItem) {
        throw new Error(`${nextPhase} does not have phase items, but you said ${nextPhaseItem}`);
      }
    }

    if (!nextPhaseItem && (!nextPhase || nextPhaseInfo.items)) {
      throw new Error('Did not receive a nextPhaseItem');
    }

    const userId = getUserId(authToken);
    const teamMemberId = `${userId}::${teamId}`;
    if (activeFacilitator !== teamMemberId) {
      throw new Error('Only the facilitator can advance the meeting');
    }

    // RESOLUTION
    const goingForwardAPhase = nextPhase && nextPhaseInfo.index > meetingPhaseInfo.index;
    const onSamePhaseWithItems = (!nextPhase || nextPhase === meetingPhase) && meetingPhaseInfo.items;

    let newMeetingPhaseItem;
    if (goingForwardAPhase) {
      newMeetingPhaseItem = nextPhaseInfo.items ? nextPhaseItem : null;
    } else if (onSamePhaseWithItems) {
      newMeetingPhaseItem = (nextPhaseItem - meetingPhaseItem === 1) ? nextPhaseItem : undefined;
    }

    const updatedState = {
      facilitatorPhase: nextPhase || undefined,
      facilitatorPhaseItem: isNaN(nextPhaseItem) ? null : nextPhaseItem,
      meetingPhase: goingForwardAPhase ? nextPhase : undefined,
      meetingPhaseItem: newMeetingPhaseItem
    };

    const {completedAgendaItem} = await r({
      team: r.table('Team').get(teamId).update(updatedState),
      completedAgendaItem: facilitatorPhase === AGENDA_ITEMS && r.table('AgendaItem')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .orderBy('sortOrder')
        .nth(facilitatorPhaseItem - 1)
        .update({isComplete: true}, {returnChanges: true})('changes')(0)('new_val').default(null)
    });

    const data = {teamId, agendaItemId: completedAgendaItem.id};
    publish(AGENDA_ITEM, teamId, MoveMeetingPayload, data, subOptions);
    publish(TEAM, teamId, MoveMeetingPayload, data, subOptions);
    return data;
  }
};
