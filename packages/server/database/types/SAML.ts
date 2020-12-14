import shortid from 'shortid'

interface Input {
  id?: string
  domain: string
  cert: string
  url: string
  metadata: string
}

export default class SAML {
  id: string
  domain: string
  cert: string
  url: string
  metadata: string
  createdAt = new Date()
  updatedAt = new Date()

  constructor(input: Input) {
    const {id, domain, cert, url, metadata} = input
    this.id = id || shortid.generate()
    this.domain = domain
    this.cert = cert
    this.url = url
    this.metadata = metadata
  }
}
