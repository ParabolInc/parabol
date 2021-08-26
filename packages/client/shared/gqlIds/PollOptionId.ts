const PollOptionId = {
  create: (pollOptionId: number) => `pollOption:${pollOptionId}`,
  split: (id: string) => {
    const [, pollOptionId] = id.split(':')
    return pollOptionId
  }
}

export default PollOptionId
