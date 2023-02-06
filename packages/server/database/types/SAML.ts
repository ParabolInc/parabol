import generateUID from '../../generateUID'

interface Input {
  id: string
  domains: string[]
  url?: string
  metadata?: string
  orgId?: string
}

export default class SAML {
  id: string
  domains: string[]
  url: string | null
  metadata: string | null
  orgId: string | null

  constructor(input: Input) {
    const {id, domains, url, metadata} = input
    this.id = id || generateUID()
    this.domains = domains
    this.url = url ?? null
    this.metadata = metadata ?? null
    this.orgId = input.orgId ?? null
  }
}
