import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {DISCUSS, RETROSPECTIVE, TEAM, VOTE} from 'universal/utils/constants'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import VoteForReflectionGroupPayload from 'server/graphql/types/VoteForReflectionGroupPayload'
import safelyCastVote from 'server/graphql/mutations/helpers/safelyCastVote'
import safelyWithdrawVote from 'server/graphql/mutations/helpers/safelyWithdrawVote'
import unlockAllStagesForPhase from 'universal/utils/unlockAllStagesForPhase'
import standardError from 'server/utils/standardError'

export default {
  type: VoteForReflectionGroupPayload,
  description: 'Cast your vote for a reflection group',
  args: {
    isUnvote: {
      type: GraphQLBoolean,
      description: 'true if the user wants to remove one of their votes'
    },
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    source,
    {isUnvote, reflectionGroupId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId)
    if (!reflectionGroup || !reflectionGroup.isActive) {
      return standardError(new Error('Reflection group not found'), {userId: viewerId})
    }
    const {meetingId} = reflectionGroup
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(VOTE, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    const meetingMember = await r
      .table('MeetingMember')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({userId: viewerId})
      .nth(0)
      .default(null)
    if (!meetingMember) {
      return standardError(new Error('Meeting member not found'), {userId: viewerId})
    }
    const {isCheckedIn} = meetingMember
    if (!isCheckedIn) {
      return standardError(new Error('Meeting member not checked in'), {userId: viewerId})
    }

    // RESOLUTION
    if (isUnvote) {
      const votingError = await safelyWithdrawVote(
        authToken,
        meetingId,
        viewerId,
        reflectionGroupId
      )
      if (votingError) return votingError
    } else {
      const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId)
      const retroSettings = allSettings.find((settings) => settings.meetingType === RETROSPECTIVE)
      const {maxVotesPerGroup} = retroSettings
      const votingError = await safelyCastVote(
        authToken,
        meetingId,
        viewerId,
        reflectionGroupId,
        maxVotesPerGroup
      )
      if (votingError) return votingError
    }
    const reflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    const voteCount = reflectionGroups.reduce((sum, group) => sum + group.voterIds.length, 0)

    let isUnlock
    let unlockedStageIds
    if (voteCount === 0) {
      isUnlock = false
    } else if (voteCount === 1 && !isUnvote) {
      isUnlock = true
    }
    if (isUnlock !== undefined) {
      unlockedStageIds = unlockAllStagesForPhase(phases, DISCUSS, true, isUnlock)
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases
        })
    }

    const data = {
      meetingId,
      userId: viewerId,
      reflectionGroupId,
      unlockedStageIds
    }
    publish(TEAM, teamId, VoteForReflectionGroupPayload, data, subOptions)
    return data
  }
}
