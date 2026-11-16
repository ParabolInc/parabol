import {BlockList, isIP} from 'node:net'

// The host label of parabol_vendor_request_duration_seconds. A host takes the most specific entry it equals or is a
// subdomain of. Customer-hosted servers, like Jira Server, self-managed GitLab and chat webhooks, are unbounded, so they
// count as other
const VENDOR_HOSTS = new Set([
  'api.atlassian.com',
  'auth.atlassian.com',
  'atlassian.net',
  'api.github.com',
  'github.com',
  'gitlab.com',
  'api.linear.app',
  'api.clickup.com',
  'app.clickup.com',
  'dev.azure.com',
  'app.vssps.visualstudio.com',
  'login.microsoftonline.com',
  'graph.microsoft.com',
  'webhook.office.com',
  'api.openai.com',
  'oauth2.googleapis.com',
  'storage.googleapis.com',
  'www.googleapis.com',
  'googleapis.com',
  'slack.com',
  'api.mailgun.net',
  'api.stripe.com',
  'amazonaws.com',
  'zoom.us',
  'api.klipy.com',
  'loom.com'
])

const privateAddresses = new BlockList()
privateAddresses.addSubnet('10.0.0.0', 8)
privateAddresses.addSubnet('100.64.0.0', 10)
privateAddresses.addSubnet('127.0.0.0', 8)
privateAddresses.addSubnet('169.254.0.0', 16)
privateAddresses.addSubnet('172.16.0.0', 12)
privateAddresses.addSubnet('192.168.0.0', 16)
privateAddresses.addAddress('::1', 'ipv6')
privateAddresses.addSubnet('fc00::', 7, 'ipv6')
privateAddresses.addSubnet('fe80::', 10, 'ipv6')

// In-cluster services like the embedding model are addressed as `http://tei-qwen3/` or `valkey.parabol.local`
const isParabolHost = (host: string) => {
  const ipVersion = isIP(host)
  if (ipVersion) return privateAddresses.check(host, ipVersion === 6 ? 'ipv6' : 'ipv4')
  return (
    !host.includes('.') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost')
  )
}

// null for Parabol's own services, whose slowness is Parabol's
const getVendorHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^\[(.*)\]$/, '$1')
  if (isParabolHost(host)) return null
  const domainLabels = host.split('.')
  for (let i = 0; i < domainLabels.length - 1; i++) {
    const suffix = domainLabels.slice(i).join('.')
    if (VENDOR_HOSTS.has(suffix)) return suffix
  }
  return 'other'
}

export default getVendorHost
