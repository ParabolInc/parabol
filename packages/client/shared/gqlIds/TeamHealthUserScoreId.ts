const TeamHealthUserScoreId = {
  join: (stageId: string, userId: string) => `teamHealthUserScore:${stageId}:${userId}`,
  split: (id: string) => {
    const [, stageId, userId] = id.split(':')
    return {stageId, userId}
  }
}

export default TeamHealthUserScoreId
