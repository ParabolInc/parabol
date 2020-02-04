import shortid from 'shortid'

interface Input {
  name: string
  teamId: string
}

export default class ReflectTemplate {
  id: string
  createdAt: Date
  isActive: boolean
  updatedAt: Date
  name: string
  teamId: string
  lastUsedAt: Date | undefined

  constructor(input: Input) {
    const {name, teamId} = input
    const now = new Date()
    this.id = shortid.generate()
    this.createdAt = now
    this.isActive = true
    this.name = name
    this.teamId = teamId
    this.updatedAt = now
  }
}
