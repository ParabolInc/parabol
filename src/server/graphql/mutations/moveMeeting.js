import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ActionMeetingPhaseEnum from 'server/graphql/types/ActionMeetingPhaseEnum';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {errorObj} from 'server/utils/utils';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import {AGENDA_ITEMS, CHECKIN, MEETING_UPDATED} from 'universal/utils/constants';

export default {
  type: UpdateMeetingPayload,
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
  async resolve(source, {force, teamId, nextPhase, nextPhaseItem}, {authToken, socketId, getDataLoader}) {
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.id();
    dataLoader.share();
    // TODO: transform these console statements into configurable logger statements:
    /*
     console.log('moveMeeting()');
     console.log('teamId');
     console.log(teamId);
     console.log('nextPhase');
     console.log(nextPhase);
     console.log('nextPhaseItem');
     console.log(nextPhaseItem);
     */
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // BAILOUT
    if (force) {
      // use this if the meeting hit an infinite redirect loop. should never occur
      await r.table('Team').get(teamId).update({
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 1,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 1
      });
      return true;
    }

    // VALIDATION
    const nextPhaseInfo = actionMeeting[nextPhase];
    const currentTeam = await r.table('Team').get(teamId);
    const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = currentTeam;
    const meetingPhaseInfo = actionMeeting[meetingPhase];
    if (nextPhase) {
      if (!nextPhaseInfo) {
        throw errorObj({_error: `${nextPhase} is not a valid phase`});
      }
      if (nextPhaseInfo.items) {
        const {arrayName} = nextPhaseInfo.items;
        if (arrayName === 'teamMembers') {
          const teamMembersCount = await r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .filter({isNotRemoved: true})
            .count();
          if (nextPhaseItem < 1 || nextPhaseItem > teamMembersCount) {
            throw errorObj({_error: 'We don’t have that many team members!'});
          }
        } else if (arrayName === 'agendaItems') {
          const agendaItemCount = await r.table('AgendaItem')
            .getAll(teamId, {index: 'teamId'})
            .filter({isActive: true})
            .count();
          if (nextPhaseItem < 1 || nextPhaseItem > agendaItemCount) {
            throw errorObj({_error: 'We don’t have that many agenda items!'});
          }
        }
        if (nextPhaseInfo.visitOnce && meetingPhaseInfo.index > nextPhaseInfo.index) {
          throw errorObj({_error: 'You can’t visit first call twice!'});
        }
      } else if (nextPhaseItem) {
        throw errorObj({_error: `${nextPhase} does not have phase items, but you said ${nextPhaseItem}`});
      }
    }

    if (!nextPhaseItem && (!nextPhase || nextPhaseInfo.items)) {
      throw errorObj({_error: 'Did not receive a nextPhaseItem'});
    }

    const userId = getUserId(authToken);
    const teamMemberId = `${userId}::${teamId}`;
    if (activeFacilitator !== teamMemberId) {
      throw errorObj({_error: 'Only the facilitator can advance the meeting'});
    }

    // RESOLUTION
    const goingForwardAPhase = nextPhase && nextPhaseInfo.index > meetingPhaseInfo.index;
    const onSamePhaseWithItems = (!nextPhase || nextPhase === meetingPhase) && meetingPhaseInfo.items;

    let completeAgendaItem;
    if (facilitatorPhase === AGENDA_ITEMS) {
      completeAgendaItem = r.table('AgendaItem')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .orderBy('sortOrder')
        .nth(facilitatorPhaseItem - 1)
        .update({isComplete: true});
    }
    /*
     console.log('moveMeeting');
     console.log(moveMeeting);
     */

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

    const {team} = await r({
      team: r.table('Team').get(teamId).update(updatedState, {returnChanges: true})('changes')(0)('new_val').default(null),
      completeAgendaItem
    });

    if (!team) {
      throw new Error('meeting already updated!');
    }
    const meetingUpdated = {team};
    getPubSub().publish(`${MEETING_UPDATED}.${teamId}`, {meetingUpdated, mutatorId: socketId, operationId});
    return meetingUpdated;
  }
};
