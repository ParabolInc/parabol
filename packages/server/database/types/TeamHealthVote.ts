interface Input {
  userId: string
  /// index in the labels array of the stage
  vote: number
}

export default class TeamHealthVote {
  userId: string
  vote: number
  constructor(input: Input) {
    const {userId, vote} = input
    this.userId = userId
    this.vote = vote
  }
}
