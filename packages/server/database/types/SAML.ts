import shortid from 'shortid'

interface Input {
  id?: string
  cert: string
  url: string
  metadata: string
}

export default class SAML {
  id: string
  cert: string
  url: string
  metadata: string
  createdAt = new Date()
  updatedAt = new Date()

  constructor(input: Input) {
    const {id, cert, url, metadata} = input
    this.id = id || shortid.generate()
    this.cert = cert
    this.url = url
    this.metadata = metadata
  }
}
