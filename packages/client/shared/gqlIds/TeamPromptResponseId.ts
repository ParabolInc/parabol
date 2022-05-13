const TeamPromptResponseId = {
  join: (responseId: number) => `teamPromptResponse:${responseId}`,
  split: (id: string) => {
    const [, responseId] = id.split(':')
    return Number(responseId)
  }
}

export default TeamPromptResponseId
