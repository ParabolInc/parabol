import generateUID from '../../generateUID'

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

  constructor(input: Input) {
    const {id, domain, cert, url, metadata} = input
    this.id = id || generateUID()
    this.domain = domain
    this.cert = cert
    this.url = url
    this.metadata = metadata
  }
}
