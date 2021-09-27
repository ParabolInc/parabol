const PollId = {
  join: (pollId: number) => `poll:${pollId}`,
  split: (id: string) => {
    const [, pollId] = id.split(':')
    return pollId
  }
}

export default PollId
