import shortid from 'shortid'

interface Input {
  id?: string
  ip: string
  email: string
  time?: Date
}

export default class FailedAuthRequest {
  id: string
  ip: string
  email: string
  time: Date
  constructor(input: Input) {
    const {id, email, ip, time} = input
    this.id = id ?? shortid.generate()
    this.email = email
    this.ip = ip
    this.time = time ?? new Date()
  }
}
