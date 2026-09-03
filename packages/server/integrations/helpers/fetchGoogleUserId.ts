import {fetch} from '@whatwg-node/fetch'

const fetchGoogleUserId = async (accessToken: string): Promise<string | Error> => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {Authorization: `Bearer ${accessToken}`}
  })
  if (!res.ok) return new Error(`Google: could not read the authorized user (${res.status})`)
  const {sub} = (await res.json()) as {sub?: string}
  if (!sub) return new Error('Google: user has no id')
  return sub
}

export default fetchGoogleUserId
