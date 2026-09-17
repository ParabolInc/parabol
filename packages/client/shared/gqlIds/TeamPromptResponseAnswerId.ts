const TeamPromptResponseAnswerId = {
  join: (answerId: number) => `teamPromptResponseAnswer:${answerId}`,
  split: (id: string) => {
    const [, answerId] = id.split(':')
    return Number(answerId)
  }
}

export default TeamPromptResponseAnswerId
