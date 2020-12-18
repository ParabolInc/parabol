interface Input {
  nameVerified: [string, boolean]
  samlId: string
  verifyToken?: string | null
  name: string
}

export default class SAMLDomain {
  nameVerified: [string, boolean]
  samlId: string
  verifyToken?: string | null
  name: string

  constructor(input: Input) {
    const {nameVerified, samlId, verifyToken, name} = input
    this.nameVerified = nameVerified
    this.samlId = samlId
    this.verifyToken = verifyToken || this.verifyToken
    this.name = name
  }
}
