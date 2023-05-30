interface Input {
  userId: string
  label: string
}

export default class TeamHealthUserScore {
  userId: string
  label: string
  constructor(input: Input) {
    const {userId, label} = input
    this.userId = userId
    this.label = label
  }
}
