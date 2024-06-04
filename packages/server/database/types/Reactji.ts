interface Input {
  userId: string
  id: string
}

export default class Reactji {
  userId: string
  id: string
  constructor(input: Input) {
    const {id, userId} = input
    this.userId = userId
    // not a GUID, the client will need a GUID
    this.id = id
  }
}
