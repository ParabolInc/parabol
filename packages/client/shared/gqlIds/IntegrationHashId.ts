
const prefixLookup = {
  jira: 'jira',
  github: 'gh'
} as const

type ValueOf<T> = T[keyof T]
type Prefix = ValueOf<typeof prefixLookup>
type Hash = `${Prefix}:${string}`
function join(service: 'jira', cloudId: string, issueKey: string): `jira:${string}:${string}`
function join(service: 'github', nameWithOwner: string, issueNumber: number | string): `gh:${string}:${number}`
function join(...args) {
  const [service, ...parts] = args
  const prefix = prefixLookup[service]
  const hash = parts.join(':')
  return `${prefix}:${hash}`
}

function split(id: `jira:${string}`): {service: 'jira', cloudId: string, issueKey: string}
function split(id: `gh:${string}`): {service: 'github', nameWithOwner: string, issueNumber: string}
function split(id: Hash) {
  const [prefix, ...parts] = id.split(':')
  const service = Object.keys(prefixLookup).find((service) => prefixLookup[service] === prefix)
  if (service === 'jira') {
    const [cloudId, issueKey] = parts
    return {service, cloudId, issueKey}
  } else if (service === 'github') {
    const [nameWithOwner, issueNumber] = parts
    return {service, nameWithOwner, issueNumber}
  }
  return {service}
}

const IntegrationHashId = {
  join,
  split
}

export default IntegrationHashId
