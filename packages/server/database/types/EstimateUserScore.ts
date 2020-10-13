interface Input {
  userId: string
  score: number
}

export default class EstimateUserScore {
  userId: string
  score: number
  constructor(input: Input) {
    const {userId, score} = input
    this.userId = userId
    this.score = score
  }
}
