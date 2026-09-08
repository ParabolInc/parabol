import type {ProbeResult} from './AccountProber'
import {inconclusive, notFound} from './AccountProber'
import probeFetchJson from './probeFetchJson'

interface UserRealmResponse {
  NameSpaceType?: string
  DomainName?: string
  FederationBrandName?: string
  CloudInstanceName?: string
}

// msTeams and azureDevOps both read this one endpoint. They are separate registry entries so each
// gets its own row, but they must not each spend an outbound request: concurrent callers for the
// same email share the in-flight promise.
const inFlight = new Map<string, Promise<ProbeResult>>()

const lookup = async (email: string): Promise<ProbeResult> => {
  const res = await probeFetchJson(
    `https://login.microsoftonline.com/getuserrealm.srf?login=${encodeURIComponent(email)}&json=1`
  )
  if (!res) return inconclusive('request failed')
  if (res.status !== 200) return inconclusive(`http ${res.status}`)
  const body = res.json as UserRealmResponse | null
  const nameSpaceType = body?.NameSpaceType
  if (!nameSpaceType) return inconclusive('no NameSpaceType in response')
  // Unknown means the address belongs to no Entra tenant at all
  if (nameSpaceType !== 'Managed' && nameSpaceType !== 'Federated') return notFound
  return {
    verdict: 'found',
    evidence: {
      nameSpaceType,
      domainName: body?.DomainName,
      federationBrandName: body?.FederationBrandName,
      cloudInstanceName: body?.CloudInstanceName
    }
  }
}

const fetchMicrosoftRealm = (email: string): Promise<ProbeResult> => {
  const pending = inFlight.get(email)
  if (pending) return pending
  const promise = lookup(email).finally(() => {
    inFlight.delete(email)
  })
  inFlight.set(email, promise)
  return promise
}

export default fetchMicrosoftRealm
