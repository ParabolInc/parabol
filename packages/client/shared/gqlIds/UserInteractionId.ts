const UserInteractionId = {
  join: (teamId: string, id: number) => `userInteraction:${teamId}:${id}`,
  split: (userInteractionId: string) => {
    const [, teamId, id] = userInteractionId.split(':')
    return {
      id: Number(id)!,
      teamId: teamId!
    }
  }
}

export default UserInteractionId
