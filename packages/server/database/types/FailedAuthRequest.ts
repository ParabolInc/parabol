interface Input {
  ip: string
  email: string
  time?: Date
  type: 'login' | 'reset'
}

export default class FailedAuthRequest {
  ip: string
  email: string
  time: Date
  type: 'login' | 'reset'
  constructor(input: Input) {
    const {email, ip, time, type} = input
    this.email = email
    this.ip = ip
    this.time = time ?? new Date()
    this.type = type
  }
}
