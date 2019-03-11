import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import ActionMeetingPhaseEnum from 'server/graphql/types/ActionMeetingPhaseEnum'
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting'
import {AGENDA_ITEM, AGENDA_ITEMS, CHECKIN, TEAM} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: MoveMeetingPayload,
  description:
    'Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too.',
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
  async resolve (
    source,
    {force, teamId, nextPhase, nextPhaseItem},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // BAILOUT
    if (force) {
      // use this if the meeting hit an infinite redirect loop. should never occur
      await r
        .table('Team')
        .get(teamId)
        .update({
          facilitatorPhase: CHECKIN,
          facilitatorPhaseItem: 1,
          meetingPhase: CHECKIN,
          meetingPhaseItem: 1
        })
      publish(TEAM, teamId, MoveMeetingPayload, {teamId}, subOptions)
      return {teamId}
    }

    // VALIDATION
    const nextPhaseInfo = actionMeeting[nextPhase]
    const currentTeam = await r.table('Team').get(teamId)
    const {
      activeFacilitator,
      facilitatorPhase,
      meetingPhase,
      facilitatorPhaseItem,
      meetingPhaseItem
    } = currentTeam
    const meetingPhaseInfo = actionMeeting[meetingPhase]
    if (nextPhase) {
      if (!nextPhaseInfo) {
        return standardError(new Error('Invalid phase'), {userId: viewerId})
      }
      if (nextPhaseInfo.items) {
        const {arrayName} = nextPhaseInfo.items
        if (arrayName === 'teamMembers') {
          const teamMembersCount = await r
            .table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .filter({isNotRemoved: true})
            .count()
          if (nextPhaseItem < 1 || nextPhaseItem > teamMembersCount) {
            return standardError(new Error('Invalid team member count'), {userId: viewerId})
          }
        } else if (arrayName === 'agendaItems') {
          const agendaItemCount = await r
            .table('AgendaItem')
            .getAll(teamId, {index: 'teamId'})
            .filter({isActive: true})
            .count()
          if (nextPhaseItem < 1 || nextPhaseItem > agendaItemCount) {
            return standardError(new Error('Invalid agenda item'), {userId: viewerId})
          }
        }
        if (nextPhaseInfo.visitOnce && meetingPhaseInfo.index > nextPhaseInfo.index) {
          return standardError(new Error('First call already visited'), {userId: viewerId})
        }
      } else if (nextPhaseItem) {
        return standardError(new Error('Invalid phase'), {userId: viewerId})
      }
    }

    if (!nextPhaseItem && (!nextPhase || nextPhaseInfo.items)) {
      return standardError(new Error('Next phase item not found'), {userId: viewerId})
    }

    const teamMemberId = `${viewerId}::${teamId}`
    if (activeFacilitator !== teamMemberId) {
      return standardError(new Error('Not facilitator'), {userId: viewerId})
    }

    // RESOLUTION
    const goingForwardAPhase = nextPhase && nextPhaseInfo.index > meetingPhaseInfo.index
    const onSamePhaseWithItems =
      (!nextPhase || nextPhase === meetingPhase) && meetingPhaseInfo.items

    let newMeetingPhaseItem
    if (goingForwardAPhase) {
      newMeetingPhaseItem = nextPhaseInfo.items ? nextPhaseItem : null
    } else if (onSamePhaseWithItems) {
      newMeetingPhaseItem = nextPhaseItem - meetingPhaseItem === 1 ? nextPhaseItem : undefined
    }

    const updatedState = {
      facilitatorPhase: nextPhase || undefined,
      facilitatorPhaseItem: isNaN(nextPhaseItem) ? null : nextPhaseItem,
      meetingPhase: goingForwardAPhase ? nextPhase : undefined,
      meetingPhaseItem: newMeetingPhaseItem
    }

    const {completedAgendaItem} = await r({
      team: r
        .table('Team')
        .get(teamId)
        .update(updatedState),
      completedAgendaItem:
        facilitatorPhase === AGENDA_ITEMS &&
        r
          .table('AgendaItem')
          .getAll(teamId, {index: 'teamId'})
          .filter({isActive: true})
          .orderBy('sortOrder')
          .nth(facilitatorPhaseItem - 1)
          .update({isComplete: true}, {returnChanges: true})('changes')(0)('new_val')
          .default(null)
    })

    const data = {
      teamId,
      agendaItemId: completedAgendaItem && completedAgendaItem.id
    }
    publish(AGENDA_ITEM, teamId, MoveMeetingPayload, data, subOptions)
    publish(TEAM, teamId, MoveMeetingPayload, data, subOptions)
    return data
  }
}
