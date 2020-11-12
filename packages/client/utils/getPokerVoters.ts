const getPokerVoters = (scores, teamMembers) => {
  // Get voters from teamMembers based on userIds in scores array
  const voters = [] as Array<any>
  scores.map(({userId}) => (
    teamMembers.find((member) => (member.userId === userId ? voters.push(member) : null))
  ))
  return voters
}

export default getPokerVoters
