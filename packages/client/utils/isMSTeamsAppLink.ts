// The Teams app's own hosts. No webhook lives on them, so a message posted there gets a 405
const MS_TEAMS_APP_HOSTS = [
  'teams.microsoft.com',
  'teams.cloud.microsoft',
  'teams.live.com',
  'teams.microsoft.us'
]

export const MS_TEAMS_APP_LINK_ERROR =
  'That is a link to Microsoft Teams, not a webhook. Paste the URL of an incoming webhook instead'

const isMSTeamsAppLink = (maybeUrl: string) => {
  let hostname: string
  try {
    hostname = new URL(maybeUrl).hostname
  } catch {
    return false
  }
  return MS_TEAMS_APP_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
}

export default isMSTeamsAppLink
