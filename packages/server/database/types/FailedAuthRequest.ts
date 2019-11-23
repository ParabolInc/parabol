interface Input {
  ip: string
  email: string
  time?: Date
}

export default class FailedAuthRequest {
  ip: string
  email: string
  time: Date
  constructor(input: Input) {
    const {email, ip, time} = input
    this.email = email
    this.ip = ip
    this.time = time ?? new Date()
  }
}
