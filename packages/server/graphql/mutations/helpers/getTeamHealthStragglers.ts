interface Input {
  teamMembers: ReadonlyArray<{userId: string}>
  meetingMembers: ReadonlyArray<{userId: string; isSpectating?: boolean | null}>
  inactiveUserIds: ReadonlySet<string>
  responses: ReadonlyArray<{userId: string; questionId: number}>
  questionIds: ReadonlyArray<number>
}

// mirrors the client's getTeamHealthRespondents: everyone on the team is expected to answer
// unless they chose to spectate. A straggler is anyone eligible who has not answered every question
const getTeamHealthStragglers = (input: Input) => {
  const {teamMembers, meetingMembers, inactiveUserIds, responses, questionIds} = input
  const spectatorIds = new Set(
    meetingMembers.filter((member) => member.isSpectating).map((member) => member.userId)
  )
  const eligibleUserIds = teamMembers
    .map(({userId}) => userId)
    .filter((userId) => !spectatorIds.has(userId) && !inactiveUserIds.has(userId))

  const answeredByUserId = new Map<string, Set<number>>()
  for (const {userId, questionId} of responses) {
    const answered = answeredByUserId.get(userId) ?? new Set<number>()
    answered.add(questionId)
    answeredByUserId.set(userId, answered)
  }
  const isComplete = (userId: string) => {
    const answered = answeredByUserId.get(userId)
    return !!answered && questionIds.every((questionId) => answered.has(questionId))
  }

  const stragglerUserIds = eligibleUserIds.filter((userId) => !isComplete(userId))
  const respondentCount = eligibleUserIds.filter((userId) => answeredByUserId.has(userId)).length
  return {eligibleUserIds, stragglerUserIds, respondentCount}
}

export default getTeamHealthStragglers
